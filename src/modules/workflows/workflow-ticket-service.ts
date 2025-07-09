import { E_TicketStatus as TicketStatus } from "@prisma/client";
import { logger } from "../../core/utils/logger";
import prismaClient from "../../core/utils/prismadb";

// -----------------------------------------------
// Fonction qui cherche le Workflow par défaut
// -----------------------------------------------
export const getDefaultWorkflow = async () => {
  try {
    const workflow = await prismaClient.workflow.findFirst({
      where: {
        isDefault: true,
        deleted: false,
      },
    });

    if (!workflow) {
      logger.error('[JOB:workflow_ticket] No default workflow found.');
      return null;
    }

    logger.info(`[JOB:workflow_ticket] Default workflow found: ${workflow.id}`);
    return workflow;
  } catch (error) {
    logger.error("Error in getDefaultWorkflow job", error);
    return null;
  }
};

// -----------------------------------------------
// Fonction qui récupère le premier Step associé à un Workflow
// -----------------------------------------------
export const getFirstStepWorkflow = async (workflowId: string) => {
  try {
    const step = await prismaClient.workflowStep.findFirst({
      where: {
        workflowId,
      },
      orderBy: {
        order: "asc",
      },
    });

    if (!step) {
      logger.error('[JOB:workflow_ticket] No first step found for the workflow.');
      return null;
    }

    logger.info(`[JOB:workflow_ticket] First step found for the workflow: ${step.id}`);
    return step;
  } catch (error) {
    logger.error("Error in getFirstStep job", error);
    return null;
  }
};

// -----------------------------------------------
// Fonction principale qui attache les tickets aux workflows
// -----------------------------------------------
export const attachTicketToWorkflow = async () => {
  try {
    logger.info("[JOB:workflow_ticket] Start attaching tickets...");

    // 1. Charger une fois pour toutes le workflow et son premier step
    const defaultWorkflow = await getDefaultWorkflow();
    if (!defaultWorkflow) {
      logger.error('[JOB:workflow_ticket] Aborting: No default workflow.');
      return;
    }

    const firstStep = await getFirstStepWorkflow(defaultWorkflow.id);
    if (!firstStep) {
      logger.error('[JOB:workflow_ticket] Aborting: No first step.');
      return;
    }

    // 2. Récupérer tous les tickets sans workflow
    const tickets = await prismaClient.ticket.findMany({
      where: {
        TicketWorkflow: {
          none: {},
        },
        deleted: false,
      },
    });

    if (tickets.length === 0) {
      logger.info("[JOB:workflow_ticket] No tickets to attach.");
      return;
    }

    logger.info(`[JOB:workflow_ticket] Found ${tickets.length} ticket(s) without workflow.`);

    // 3. Traiter les tickets
    for (const ticket of tickets) {
      try {
        // Transaction atomique pour chaque ticket (attacher + update status)
        await prismaClient.$transaction([
          prismaClient.ticketWorkflow.create({
            data: {
              ticketId: ticket.id,
              workflowId: defaultWorkflow.id,
              workflowCurrentStepId: firstStep.id,
              createdBy: "", //TODO
              updatedBy: ""
            },
          }),
          prismaClient.ticket.update({
            where: { id: ticket.id },
            data: {
              status: TicketStatus.PENDING_WORKFLOW_VALIDATION,
            },
          }),
        ]);

        logger.info(`[JOB:workflow_ticket] Ticket ${ticket.id} attached successfully.`);
      } catch (ticketError) {
        logger.error(`[JOB:workflow_ticket] Failed to attach ticket ${ticket.id}`, ticketError);
        // On continue avec les autres tickets même en cas d'erreur
      }
    }

    logger.info("[JOB:workflow_ticket] Finished attaching all tickets.");
  } catch (error) {
    logger.error("Critical error in workflow_ticket job", error);
  }
};



