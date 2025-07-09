import { PrismaClient, E_ViewScope as ViewScope } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';


// Instantiate the Prisma Client
const prisma = new PrismaClient();

// List of roles
export type RoleName = 
  | 'ADMIN'
  | 'ADMIN/TECHNIQUE'
  | 'ADMIN/FUNCTIONAL'
  | 'SUPPORT'
  | 'AUDITOR'
  | 'MMS-OPERATOR'
  | 'KAM'
  | 'CA'
  | 'DELCOM'
  | 'DR'
  | 'GC'
  | 'R/GC-1'
  | 'R/GC-2'
  | 'MANAGER'; 

export const roles: { name: RoleName, description: string, viewScope: ViewScope }[] = [
  {
    name: 'ADMIN',
    description: 'Accès complet à toutes les fonctionnalités du système avec droits administratifs',
    viewScope: "NATIONAL"
  },
  {
    name: 'ADMIN/TECHNIQUE',
    description: 'Administrateur technique responsable de la maintenance et des configurations système',
    viewScope: "NATIONAL"
  },
  {
    name: 'ADMIN/FUNCTIONAL',
    description: 'Administrateur fonctionnel gérant les processus métiers et les workflows',
    viewScope: "NATIONAL"
  },
  {
    name: 'SUPPORT',
    description: 'Support fonctionnel Niveau 1',
    viewScope: "NATIONAL"
  },
  {
    name: 'AUDITOR',
    description: 'Auditeur : Accès en lecture seule pour auditer les activités et données du système',
    viewScope: "NATIONAL"
  },
  {
    name: 'MMS-OPERATOR',
    description: 'Operateur MMS : Accès aux opérations liées à la gestion des process de coupures/remise',
    viewScope: "NATIONAL"
  },
  {
    name: 'KAM',
    description: 'Key Account Manager',
    viewScope: "DELCOM"
  },
  {
    name: 'CA',
    description: 'Chef Agence',
    viewScope: "DELCOM"
  },
  {
    name: 'DELCOM',
    description: 'Délégue commercial',
    viewScope: "DELCOM"
  },
  {
    name: 'DR',
    description: 'Directeur régional',
    viewScope: "REGION"
  },
   {
    name: 'GC',
    description: 'Gestionnaire Grand compte',
    viewScope: "NATIONAL"
  },
  {
    name: 'R/GC-1',
    description: 'Responsable GC niveau 1',
    viewScope: "NATIONAL"
  },
  {
    name: 'R/GC-2',
    description: 'Responsable GC niveau 2',
    viewScope: "NATIONAL"
  },
  {
    name: 'MANAGER',
    description: 'MANAGEUR : Gestionnaire d\'équipe avec accès aux rapports et statistiques',
    viewScope: "NATIONAL"
  }
] as const;


export async function seed_roles() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (!existing) {
    return
  }
  const rolePromises = roles.map(role =>
    prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        viewScope: role.viewScope,
        createdBy: existing.id,
        updatedBy: existing.id
      },
    })
  );
  const createdRoles = await Promise.all(rolePromises);
  console.log(`✅ Created roles`);
  console.log(`${roles.map(role => role.name).join(', ')}`);
  createdRoles.forEach(item => {
    console.log(`- ${item.name.padEnd(40)} with id : ${item.id}`);
  });
  return createdRoles;
}
