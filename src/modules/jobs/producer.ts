// Crée des jobs à partir d’actions métiers (ticket validé, API, etc.)

import { E_Application, E_JobAction as JobAction, E_JobStatus as JobStatus, E_TicketStatus as TicketStatus  } from '@prisma/client';
import { createJob } from './job.service';
import { logger } from '../../core/utils/logger';
import prismaClient from '../../core/utils/prismadb';

export const enqueueTicketJob = async () => {
    // Récupère les ticket APPROVED donc on doit creer les JOB
    const tickets = await prismaClient.ticket.findMany({
        where: {
            status: TicketStatus.APPROVED,
        },
        include: {
            Job: true,
            TicketType: true
        },
        take: 10, // tu peux ajuster le batch size
    });
    for (const ticket of tickets) {
        const action = ticket.TicketType.name.toLowerCase() as JobAction;
        if (!(["disconnect", "reconnect"] as const).includes(action as "disconnect" | "reconnect")) {
            console.warn(`⚠️ Ticket ${ticket.id} a un type d'action invalide: ${action}`);
            continue;
        }
        try {
            await prismaClient.$transaction([
                // 1. Créer le job
                prismaClient.job.create({
                    data: {
                        app: E_Application.MMS,
                        ressource: ticket.reference,
                        ticketId: ticket.id,
                        userId: 'SYSTEM',
                        action,
                        status: JobStatus.PENDING,
                    },
                }),

                // 2. Mettre à jour le ticket
                prismaClient.ticket.update({
                    where: { id: ticket.id },
                    data: { status: TicketStatus.IN_PROCESSING },
                }),
            ]);
            console.log(`✅ Job créé et ticket ${ticket.id} passé à IN_PROCESSING`);
        } catch (err) {
            console.error(`❌ Erreur lors de la création du job pour le ticket ${ticket.id}::`, err);
        }
    }
};


export const enqueueReadJob = async (ticketId: string, ressource: string, userId?: string) => {
    return createJob({
        app: E_Application.MMS,
        ressource,
        ticketId,
        userId,
        action: JobAction.READ
    });
};
