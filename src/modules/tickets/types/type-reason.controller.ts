import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';

import { redis } from '../../../core/utils/redis';
import prismaClient from '../../../core/utils/prismadb';
import { HTTPSTATUS } from '../../../config/http.config';
import NotFoundException from '../../../core/exceptions/not-found';
import BadRequestException from '../../../core/exceptions/bad-requests';

import { serviceType } from '../../../constants/enum';

import { getUserConnected } from '../../../core/utils/authentificationService';
import { TypeReasonsSchema as schema, TypeReasonsbulkCreateSchema as bulkCreateSchema } from './type.schemas';



const key = serviceType.TICKET_TYPE_REASON;

//-----------------------------------------------------------------------------
//             CREATE 
//-----------------------------------------------------------------------------
export const create =
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await getUserConnected(req);

        const parsed = schema.parse(req.body);
        try {
            // Vérifier si le type existe
            let ticketType = await prisma.ticketType.findUnique({
                where: { name: parsed.type },
            });

            if (!ticketType) {
                // Créer le type avec toutes les raisons
                ticketType = await prisma.ticketType.create({
                    data: {
                        name: parsed.type,
                        createdBy: user.id,
                        updatedBy: user.id,
                        TicketTypeReason: {
                            create: parsed.reasons.map(reason => ({
                                name: reason.name,
                                createdBy: user.id,
                                updatedBy: user.id
                            }))
                        }
                    },
                    include: { TicketTypeReason: true }
                });

                // Mettre à jour le cache Redis
                revalidateService(key);

                return res.status(HTTPSTATUS.CREATED).json({
                    success: true,
                    data: ticketType
                });
            }

            // Si le type existe, ajouter uniquement les reasons manquantes
            const existingReasons = await prisma.ticketTypeReason.findMany({
                where: {
                    TicketTypeId: ticketType.id,
                },
                select: { name: true }
            });

            const existingReasonNames = existingReasons.map((r: { name: string }) => r.name);

            const newReasons = parsed.reasons.filter(
                r => !existingReasonNames.includes(r.name)
            );

            const createdReasons = await Promise.all(
                newReasons.map(r =>
                    prisma.ticketTypeReason.create({
                        data: {
                            name: r.name,
                            TicketTypeId: ticketType.id,
                            createdBy: user.id,
                            updatedBy: user.id
                        }
                    })
                )
            );

            // Mettre à jour le cache Redis
            revalidateService(key);

            return res.status(HTTPSTATUS.OK).json({
                success: true,
                message: `TicketType '${parsed.type}' already exists. ${createdReasons.length} new reason(s) added.`,
                data: {
                    ticketType,
                    newReasons: createdReasons
                }
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, errors: error.flatten() });
            }
            console.error('❌ Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };


//-----------------------------------------------------------------------------
//             GET ALL
//-----------------------------------------------------------------------------
export const get =
    async ( res: Response, next: NextFunction) => {
        let data;

        const redis_data = await redis.get(key);
        if (redis_data) {
            data = JSON.parse(redis_data);
        } else {
            data = await revalidateService(key);
        }

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });
    }


//-----------------------------------------------------------------------------
//             GET BY ID
//-----------------------------------------------------------------------------
export const getById =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params');

        const data = await prismaClient.ticketType.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                TicketTypeReason: {
                    where: {
                        deleted: false
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true 
                    }
                }
            }
        });
        if (!data) throw new NotFoundException("Item not found");

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };


//-----------------------------------------------------------------------------
//             BULK-CREATE
//-----------------------------------------------------------------------------
export const bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserConnected(req);

    // Validate input
    const parsedData = bulkCreateSchema.parse(req.body);

    // Check for duplicate names
    const existingRessources = await Promise.all(parsedData.data.map(async item => {
        return await prismaClient.ticketType.findFirst({ where: { name: item.name } });
    }));

    const duplicates = existingRessources.filter(item => item);
    if (duplicates.length > 0) {
        return res.status(422).json({
            success: false,
            message: "Duplicate setting names found",
            duplicates: duplicates.map(item => item?.name)
        });
    }

    const created = await Promise.all(parsedData.data.map(item =>
        prismaClient.ticketType.create({
            data: {
                ...item,
                createdBy: user.id,
                updatedBy: user.id
            }
        })
    ));

    revalidateService(key);

    res.status(201).json({
        success: true,
        data: created
    });

};



const revalidateService = async (key: string) => {
    const data = await prisma.ticketType.findMany({
        where: {
            deleted: false
        },
        select: {
            id: true,
            name: true,
            TicketTypeReason: {
                where: {
                    deleted: false
                },
                select: {
                    id: true,
                    name: true,
                    // description: true // Décommente si ce champ existe dans ton modèle
                }
            }
        }
    });
    await redis.set(key, JSON.stringify(data));
    return data
}