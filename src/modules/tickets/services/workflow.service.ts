import { Ticket, Workflow } from "@prisma/client"


export const determineWorkflow = async function (ticket: Ticket) {
  const workflows = await prisma.workflow.findMany({
    where: { isActive: true, deleted: false },
    include: { steps: true },
  })

  const matchingWorkflow = workflows.find((wf: Workflow) =>
    ticket.type && wf.name.toLowerCase() === (ticket.type as string).toLowerCase()
  )

  return matchingWorkflow ?? await prisma.workflow.findFirst({
    where: { name: 'default', isActive: true },
    include: { steps: true },
  })
}


const getWorkflowFirstStep = (workflow: Work ) => {
  return workflow.steps.find((step: any) => step.order === 1)
}



// import { WorkflowStep } from "@prisma/client";
// import prismaClient from "../../../core/utils/prismadb";


// async function moveToNextStep(ticketId: string, userId: string) {
//   // 1. Récupérer le ticket et son état actuel
//   const ticket = await prismaClient.ticket.findUnique({
//     where: { id: ticketId },
//     include: {
//         workflowCurrentStep: {
//         include: {
//           outgoingTransitions: {
//             include: { toStep: true }
//           }
//         }
//       },
//     }
//   });

//   if (!ticket) throw new Error('Ticket non trouvé');
//   if (!ticket.workflowcurrentStepId) throw new Error('Aucune étape actuelle');

//   // 2. Vérifier que toutes les validations sont complètes
//   const currentState = await prisma.workflowState.findFirst({
//     where: {
//       ticketId,
//       stepId: ticket.workflowcurrentStepId,
//       status: 'APPROVED'
//     }
//   });

//   if (!currentState) {
//     throw new Error("Les validations de l'étape actuelle ne sont pas complètes");
//   }

//   // 3. Trouver la prochaine étape
//   let nextStep: WorkflowStep | null = null;

// //   // Cas 1: Transition explicite définie
// //   for (const transition of ticket.workflowCurrentStep?.outgoingTransitions) {
// //     if (evaluateTransitionCondition(transition, ticket)) {
// //       nextStep = transition.toStep;
// //       break;
// //     }
// //   }

// //   // Cas 2: Transition implicite par ordre
// //   if (!nextStep && ticket.workflow) {
// //     const currentOrder = ticket.currentStep.order;
// //     nextStep = ticket.workflow.steps.find(s => s.order === currentOrder + 1) || null;
// //   }

// //   if (!nextStep) {
// //     throw new Error('Aucune étape suivante trouvée');
// //   }

// //   // 4. Mettre à jour le ticket
// //   const updatedTicket = await prisma.ticket.update({
// //     where: { id: ticketId },
// //     data: {
// //       currentStepId: nextStep.id,
// //       status: nextStep.order === 1 ? 'IN_PROGRESS' : 
// //              isFinalStep(nextStep) ? 'COMPLETED' : 'PENDING_APPROVAL'
// //     },
// //     include: { currentStep: true }
// //   });

// //   // 5. Enregistrer dans l'historique
// //   await prisma.ticketHistory.create({
// //     data: {
// //       ticketId,
// //       fromStepId: ticket.currentStepId,
// //       toStepId: nextStep.id,
// //       action: 'STEP_CHANGE',
// //       createdBy: userId
// //     }
// //   });

// //   // 6. Initialiser les validations pour la nouvelle étape
// //   await initializeValidations(ticketId, nextStep.id);

// //   // 7. Envoyer les notifications
// //   await sendStepNotifications(ticketId, nextStep.id);

//  //  return updatedTicket;
// }


// Fonctions helpers
// function evaluateTransitionCondition(transition: WorkflowTransition, ticket: Ticket): boolean {
//   if (!transition.condition) return true;
  
//   // Implémentez votre logique d'évaluation des conditions
//   // Exemple simple: condition = "status=APPROVED"
//   const [key, value] = transition.condition.split('=');
//   return ticket[key as keyof Ticket] === value;
// }

// function isFinalStep(step: WorkflowStep): boolean {
//   // Déterminez si c'est la dernière étape (par exemple pas de transitions sortantes)
//   return step.outgoingTransitions.length === 0;
// }

// async function initializeValidations(ticketId: string, stepId: string) {
//   const validations = await prisma.workflowValidation.findMany({
//     where: { stepId }
//   });

//   if (validations.length > 0) {
//     const workflowState = await prisma.workflowState.create({
//       data: {
//         ticketId,
//         stepId,
//         status: 'PENDING'
//       }
//     });

//     await prisma.ticketValidation.createMany({
//       data: validations.map(v => ({
//         workflowStateId: workflowState.id,
//         validationId: v.id
//       }))
//     });
//   }
// }