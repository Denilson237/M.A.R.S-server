import { NextFunction, Request, Response } from "express";

import { idSchema } from "../ticket.schemas";
import prismaClient from "../../../core/utils/prismadb";
import { HTTPSTATUS } from "../../../config/http.config";
import BadRequestException from "../../../core/exceptions/bad-requests";
import { getUserConnected } from "../../../core/utils/authentificationService";
import { E_TicketStatus as TicketStatus, E_ValidationActionType as ValidationActionType } from "@prisma/client";


// POST /tickets/:id/validate
export const validateTicket =
    async (req: Request, res: Response, next: NextFunction) => {
        // Extract the ticket ID from the request parameters
        const id = req.params.id;
        if (!id) throw new BadRequestException('Invalid params')

        // Validate the provided ID using the idSchema
        const ticketId = idSchema.parse(id);
        if (!ticketId) throw new BadRequestException('Invalid params')

        // Retrieve the connected user for audit and notification purposes 
        const user = await getUserConnected(req);

        const userId = user.id;
        const userRoleId = user.role.id;
        const comment = req.body.comment ?? '';

        try {
            const ticketWorkflow = await prismaClient.ticketWorkflow.findFirst({
                where: { ticketId },
                include: {
                    WorkflowCurrentStep: {
                        include: {
                            Validations: {
                                include: {
                                    ValidationRoles: true,
                                    ValidationUsers: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!ticketWorkflow) {
                return res.status(404).json({ success: false, message: 'Ticket ou workflow introuvable.' });
            }

            const currentStepId = ticketWorkflow.workflowCurrentStepId;
            const validations = ticketWorkflow.WorkflowCurrentStep?.Validations ?? [];

            // Vérification des autorisations
            const isAuthorized = validations.some((validation) => {
                const userMatch = validation.ValidationUsers.some((vu) => vu.userId === userId);
                const roleMatch = validation.ValidationRoles.some((vr) => vr.roleId === userRoleId);
                return userMatch || roleMatch;
            });

            if (!isAuthorized) {
                return res.status(403).json({ success: false, message: 'Utilisateur non autorisé à valider cette étape.' });
            }

            const transition = await prismaClient.workflowTransition.findFirst({
                where: { fromStepId: currentStepId },
            });

            const nextStepId = transition?.toStepId ?? null;

            const isFinalStep = !nextStepId;

            // 4. Préparer les opérations
            const operations: any[] = [
                  //TODO
                // prismaClient.ticketHistory.create({
                //     data: {
                //         ticketId,
                //         fromStepId: currentStepId,
                //         toStepId: nextStepId ?? currentStepId,
                //         actionById: userId,
                //         comment,
                //         workflowStepId: currentStepId,
                //         userId
                //     }
                // }),
                prismaClient.ticketWorkflowValidationAction.create({
                    data: {
                        ticketId,
                        workflowStepId: currentStepId,
                        userId,
                        validatedAt: new Date(),
                        comment,
                        status: 'APPROVED' // tu peux aussi stocker 'REJECTED' dans le endpoint de rejet
                    }
                })
            ];

            if (isFinalStep) {
                // Étape finale : clôturer le ticket
                operations.push(
                    prismaClient.ticket.update({
                        where: { id: ticketId },
                        data: {
                            status: TicketStatus.APPROVED,
                            updatedBy: userId
                        }
                    })
                );
            } else {
                // Sinon, passer à l'étape suivante
                operations.push(
                    prismaClient.ticketWorkflow.update({
                        where: {
                            ticketId_workflowId: {
                                ticketId,
                                workflowId: ticketWorkflow.workflowId
                            }
                        },
                        data: {
                            workflowCurrentStepId: nextStepId
                        }
                    })
                );
            }

            // 5. Exécuter les opérations
            await prismaClient.$transaction(operations);

            return res.status(HTTPSTATUS.OK).json({ success: true, message: isFinalStep ? 'Ticket validé et clôturé avec succès.' : 'Ticket validé avec succès.' });
        } catch (error) {
            console.error('Erreur de validation du ticket :', error);
            return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Erreur serveur interne.' });
        }
    };



// POST /tickets/:id/reject
export const rejectTicket = async (req: Request, res: Response) => {
    // Extract the ticket ID from the request parameters
    const id = req.params.id;
    if (!id) throw new BadRequestException('Invalid params')

    // Validate the provided ID using the idSchema
    const ticketId = idSchema.parse(id);
    if (!ticketId) throw new BadRequestException('Invalid params')

    // Retrieve the connected user for audit and notification purposes 
    const user = await getUserConnected(req);

    const userId = user.id;
    const userRoleId = user.role.id;
    const comment = req.body.comment ?? '';

    try {
        const ticketWorkflow = await prismaClient.ticketWorkflow.findFirst({
            where: { ticketId },
            include: {
                WorkflowCurrentStep: {
                    include: {
                        Validations: {
                            include: {
                                ValidationRoles: true,
                                ValidationUsers: true,
                            },
                        },
                    },
                },
            },
        });

        if (!ticketWorkflow) {
            return res.status(404).json({ success: false, message: 'Ticket ou workflow introuvable.' });
        }

        const currentStepId = ticketWorkflow.workflowCurrentStepId;
        const validations = ticketWorkflow.WorkflowCurrentStep?.Validations ?? [];

        // Vérification des autorisations
        const isAuthorized = validations.some((validation) => {
            const userMatch = validation.ValidationUsers.some((vu) => vu.userId === userId);
            const roleMatch = validation.ValidationRoles.some((vr) => vr.roleId === userRoleId);
            return userMatch || roleMatch;
        });

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Utilisateur non autorisé à rejeter cette étape.' });
        }

        await prismaClient.$transaction([
            // 1. Rejet le ticket dans le cas ou l'approvalPolicy est all
            prismaClient.ticket.update({
                where: { id: ticketId },
                data: {
                    status: TicketStatus.REJECTED
                },
            }),

            //TODO
            // 1. Historique du rejet 
            // prismaClient.ticketHistory.create({
            //     data: {
            //         ticketId,
            //         fromStepId: currentStepId,
            //         toStepId: currentStepId, // reste sur place
            //         actionById: userId,
            //         comment,
            //         workflowStepId: currentStepId,
            //         userId,
            //     },
            // }),

            // 2. Enregistrement de l'action de rejet
            prismaClient.ticketWorkflowValidationAction.create({
                data: {
                    ticketId,
                    workflowStepId: currentStepId,
                    userId,
                    validatedAt: new Date(),
                    comment,
                    status: ValidationActionType.REJECTED,
                },
            }),
        ]);

        return res.status(HTTPSTATUS.OK).json({ success: true, message: 'Ticket rejeté avec succès.' });
    } catch (error) {
        console.error('Erreur lors du rejet du ticket :', error);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Erreur serveur interne.' });
    }
};
