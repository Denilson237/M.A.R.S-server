import { NextFunction, Request, Response } from 'express';

import { redis } from '../../../../core/utils/redis';
import prismaClient from '../../../../core/utils/prismadb';
import { HTTPSTATUS } from '../../../../config/http.config';
import { ErrorCode } from '../../../../core/enums/error-code.enum';
import NotFoundException from '../../../../core/exceptions/not-found';
import BadRequestException from '../../../../core/exceptions/bad-requests';
import UnprocessableException from '../../../../core/exceptions/unprocessable';

import { serviceType } from '../../../../constants/enum';
import { schema ,bulkCreateSchema, IBulkCreateRequest, bulkDeleteSchema, updateSchema } from './reasons.schemas';
import { getUserConnected } from '../../../../core/utils/authentificationService';


const key = serviceType.TICKET_TYPE_REASON+"_LIGHT";

//-----------------------------------------------------------------------------
//             CREATE 
//-----------------------------------------------------------------------------
export const create =
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await getUserConnected(req);

        const parsed = schema.parse(req.body);

        const isAlready = await prismaClient.ticketTypeReason.findFirst({ where: { name: parsed.name } });
        if (isAlready) {
            throw new UnprocessableException("Duplicate setting name");
        }
        const data = await prismaClient.ticketTypeReason.create({
            data: {
                ...parsed,
                TicketTypeId: parsed.typeId,
                createdBy: user.id,
                updatedBy: user.id,
            },
        });

        revalidateService(key);

        res.status(HTTPSTATUS.CREATED).json({
            success: true,
            data
        });
    };


//-----------------------------------------------------------------------------
//             GET ALL
//-----------------------------------------------------------------------------
export const get =
    async (req: Request, res: Response, next: NextFunction) => {
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

        const data = await prismaClient.ticketTypeReason.findUnique({
            where: { id: id },
        });
        if (!data) throw new NotFoundException("Item not found");

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };

//-----------------------------------------------------------------------------
//             UPDATE
//-----------------------------------------------------------------------------
export const update =
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await getUserConnected(req);

        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params');

        const parsed = updateSchema.parse(req.body); // Validate input

        const data = await prismaClient.ticketTypeReason.update({
            where: { id: id },
            data: {
                ...parsed,
                updatedBy: user.id,
                updatedAt: new Date()
            },
        });

        revalidateService(key);

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };


//-----------------------------------------------------------------------------
//             DELETE
//-----------------------------------------------------------------------------
export const remove =
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await getUserConnected(req);

        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        await prismaClient.ticketTypeReason.update({
            where: { id: id },
            data: {
                deleted: true,
                deletedAt: new Date(),
                deletedBy: user.id
            },
        });
        revalidateService(key);

        res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

    };


//-----------------------------------------------------------------------------
//            HARD-DELETE  
//-----------------------------------------------------------------------------
export const hardRemove =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params');

        await prismaClient.ticketTypeReason.delete({
            where: { id: id },
        });

        revalidateService(key);

       res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

    };


//-----------------------------------------------------------------------------
//             BULK-CREATE
//-----------------------------------------------------------------------------
export const bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserConnected(req);

    // Validate input
    const parsedData = bulkCreateSchema.parse(req.body as IBulkCreateRequest);

    // Check for duplicate names
    const existingRessources = await Promise.all(parsedData.data.map(async item => {
        return await prismaClient.ticketTypeReason.findFirst({ where: { name: item.name } });
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
        prismaClient.ticketTypeReason.create({
            data: {
                ...item,
                TicketTypeId: item.typeId,
                createdBy: user.id,
                updatedBy:  user.id
            }
        })
    ));

    revalidateService(key);

    res.status(201).json({
        success: true,
        data: created
    });

};

//-----------------------------------------------------------------------------
//             BULK-DELETE 
//-----------------------------------------------------------------------------
export const bulkRemove = async (req: Request, res: Response, next: NextFunction) => {

    // Validate input using Zod
    const { ids } = bulkDeleteSchema.parse(req.body);

    // Perform bulk delete
    await prismaClient.ticketTypeReason.deleteMany({
        where: {
            id: { in: ids } // Use 'in' to delete all matching IDs in one query
        }
    });

    revalidateService(key);

    // Send response
    res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

};

const revalidateService = async (key: string) => {
    const data = await prismaClient.ticketTypeReason.findMany({
        orderBy: {
            name: 'asc',
        },
    });
    await redis.set(key, JSON.stringify(data));
    return data
}