import {
  E_ApprovalPolicy as ApprovalPolicy,
  E_ConditionType as ConditionType,
  E_ValidationType as ValidationType,
  PrismaClient, Role, User
} from '@prisma/client';

import { RoleName } from './seed-role';
import { AuthService } from '../../../src/modules/auth/auth.service';


const prisma = new PrismaClient();

type WorkflowConfig = {
  name: string;
  description: string;
  roles: Record<string, RoleName>;
  steps: {
    name: string;
    type: ValidationType;
    requiredApprovals?: number;
    description: string;
    roleKey: string;
  }[];
};

type WorkflowAutoApprovalConfig = {
  name: string;
  description: string;
  steps: {
    name: string;
    description: string;
  }[];
};

const AUTO_WORKFLOWS_CONFIG: Record<string, WorkflowAutoApprovalConfig> = {
  autoReconnection: {
    name: 'REMISE-AUTOMATIQUE',
    description: 'Workflow de remise automatique avec validation automatique par le système',
    steps: [
      {
        name: 'System Auto-Approval',
        description: 'Validation automatique du systeme'
      }
    ]
  }
}

const WORKFLOWS_CONFIG: Record<string, WorkflowConfig> = {
  customerReferenceGC: {
    name: 'MISE-A-JOUR-REFERNTIEL-GC',
    description: 'Workflow pour la validation des demandes mise à jour du référentiel GC',
    roles: {
      l1: 'R/GC-1',
      l2: 'R/GC-2'
    },
    steps: [
      {
        name: 'Validation Responsable GC Niveau 1',
        description: 'En attente de validation Responsable GC niveau 1',
        roleKey: 'l1',
        type: "ROLE"
      },
      {
        name: 'Validation Responsable GC Niveau 2',
        description: 'En attente de validation Responsable GC niveau 2',
        roleKey: 'l2',
        type: "ROLE"
      }
    ]
  },
  disconnectionReconnection: {
    name: 'COUPURE/REMISE',
    description: 'Workflow pour la validation des demandes de coupures/remise',
    roles: {
      l1: 'DELCOM',
      l2: 'DR'
    },
    steps: [
      {
        name: 'Validation DEC',
        description: 'En attente de validation DEC',
        roleKey: 'l1',
        type: "ROLE"
      },
      {
        name: 'Validation DR',
        description: 'En attente de validation DR',
        roleKey: 'l2',
        type: "ROLE"
      }
    ]
  },
};


const createErrorLog = (config: WorkflowConfig, foundRoles: Record<string, Role | null>) => {
  const roleEntries = Object.entries(config.roles)
    .map(([key, roleName]) => `   - ${roleName} role ${foundRoles[key] ? '✅ Found' : '❌ Missing'}`)
    .join('\n');

  return `
🔴❌ WORKFLOW SEEDING FAILED: MISSING REQUIRED ROLES
══════════════════════════════════════════════════

📌 Error: 
   The system could not find the required validation roles:
${roleEntries}

🚀 Required Actions:
   1. Create missing roles using your role seeding script
   2. Verify roles exist in database:
      SELECT * FROM roles WHERE name IN (${Object.values(config.roles).map(r => `'${r}'`).join(', ')});
   3. Re-run this workflow creation script

🔧 Technical Details:
   - Failed operation: Workflow step validation setup
   - Error type: Prisma query returned null
   - Impact: Cannot create validation workflow without these roles
   - Related tables: roles, workflow_validations

💡 Pro Tip: Run 'prisma studio' to inspect your role data visually
`;
};

const createWorkflow = async (workflowType: keyof typeof WORKFLOWS_CONFIG, existingUser: User): Promise<any> => {
  const config = WORKFLOWS_CONFIG[workflowType];

  // 1. Vérifier que les roles sont disponibles
  const roleResults = await Promise.all(
    Object.entries(config.roles).map(async ([key, roleName]) => {
      const role = await prisma.role.findFirst({ where: { name: roleName } });
      return { key, role };
    })
  );

  const roles = Object.fromEntries(roleResults.map(r => [r.key, r.role]));
  const allRolesFound = roleResults.every(r => r.role !== null);

  if (!allRolesFound) {
    console.error(createErrorLog(config, roles));
    return;
  }

  // 2. Créer un workflow de validation avec ses étapes et validations
  try {
    return await prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          name: config.name,
          description: config.description,
          isActive: true,
          isDefault: true,
          createdBy: existingUser.id,
          updatedBy: existingUser.id,
          Steps: {
            create: config.steps.map((step, index) => ({
              name: step.name,
              description: step.description,
              order: index + 1,
              createdBy: existingUser.id,
              updatedBy: existingUser.id,
              Validations: {
                create: {
                  type: step.type ?? ValidationType.ROLE,
                  requiredApprovals: step.requiredApprovals ?? 1,
                  approvalPolicy: ApprovalPolicy.ALL,
                  createdBy: existingUser.id,
                  updatedBy: existingUser.id,
                  ValidationRoles: {
                    create: {
                      roleId: roles[step.roleKey]!.id,
                      createdBy: existingUser.id,
                      updatedBy: existingUser.id,
                    }
                  }
                }
              }
            }))
          }
        },
        include: {
          Steps: {
            include: {
              Validations: {
                include: {
                  ValidationRoles: true
                }
              }
            }
          }
        }
      });

      // 3. Créer les transitions entre les étapes
      for (let i = 0; i < workflow.Steps.length - 1; i++) {
        await tx.workflowTransition.create({
          data: {
            fromStepId: workflow.Steps[i].id,
            toStepId: workflow.Steps[i + 1].id,
            conditionType: ConditionType.EXPRESSION,
            conditionValue: 'approved == true',
            createdBy: existingUser.id,
            updatedBy: existingUser.id,
          }
        });
      }

      console.log('✅ Workflow created successfully');
      console.log(`- Workflow ${workflow.name} -> ID :`, workflow.id);
      console.log('- Steps:');
      workflow.Steps.forEach(step => {
        console.log(`  - ${step.name} (${step.id})`);
        step.Validations.forEach(validation => {
          console.log(`    - Validation: ${validation.type}`);
          logValidationRoles(validation.ValidationRoles);
        });
      });
      console.log(' ');

      function logValidationRoles(validationRoles: any[]) {
        validationRoles.forEach(vr => {
          console.log(`      - Rôle ID: ${vr.roleId}`);
        });
      }
      return workflow;
    });
  } catch (error) {
    console.error(`❌ Error creating workflow ${workflowType}:`, error);
    throw error;
  }

}

const createWorkflowAutoApproval = async (workflowType: keyof typeof AUTO_WORKFLOWS_CONFIG, existingUser: User): Promise<any> => {
  const config = AUTO_WORKFLOWS_CONFIG[workflowType];

  // 1. Create the auto-approval workflow
  try {
    return await prisma.$transaction(async (tx) => {
      const workflow = await prisma.workflow.create({
        data: {
          name: config.name,
          description: config.description,
          isActive: true,
          isDefault: false,
          createdBy: existingUser.id,
          updatedBy: existingUser.id,
          Steps: {
            create: config.steps.map((step, index) => ({
              name: step.name,
              description: step.description,
              order: index + 1,
              createdBy: existingUser.id,
              updatedBy: existingUser.id,
              Validations: {
                create: {
                  type: ValidationType.AUTO,
                  requiredApprovals: 1,
                  approvalPolicy: ApprovalPolicy.ALL,
                  createdBy: existingUser.id,
                  updatedBy: existingUser.id
                }
              }
            }))
          }
        },
        include: {
          Steps: {
            include: {
              Validations: true
            }
          }
        }
      });
      console.log(`  `)
      console.log('✅ Workflow created successfully');
      console.log(`- Workflow ${workflow.name} -> ID :`, workflow.id);
      console.log('- Steps:');
      workflow.Steps.forEach(step => {
        console.log(`  - ${step.name} (${step.id})`);
        step.Validations.forEach(validation => {
          console.log(`    - Validation: ${validation.type}`);
        });
      });

    })
  } catch (error: any) {
    console.error(`
    🔴❌ AUTO-APPROVAL WORKFLOW CREATION FAILED
    ========================================
    Error: ${error.message}
    
    Ensure your Prisma schema supports:
    - ValidationType.AUTO enum value
    - Automatic transition conditions
    `);
  }
}

export async function seed_workflow() {
  const existing = await (new AuthService()).getUserSYSTEM();
  if (!existing) {
    return
  }

  // 1. Nettoyer la base existante
  await prisma.$transaction([
    prisma.ticketHistory.deleteMany(),
    prisma.ticketWorkflow.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.workflowTransition.deleteMany(),
    prisma.workflowValidationRole.deleteMany(),
    prisma.workflowValidationUser.deleteMany(),
    prisma.workflowValidation.deleteMany(),
    prisma.workflowStep.deleteMany(),
    prisma.workflow.deleteMany(),
  ]);

  // 2. Insertion des Workflows
  try {
    await createWorkflow('customerReferenceGC', existing);
    await createWorkflow('disconnectionReconnection', existing);
    await createWorkflowAutoApproval('autoReconnection', existing);
  } catch (error) {
    console.error(`❌ Error creating workflow`, error);
  }

}
