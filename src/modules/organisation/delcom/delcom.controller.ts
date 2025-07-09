import { NextFunction, Request, Response } from 'express';

import { redis } from '../../../core/utils/redis';
import { serviceType } from '../../../constants/enum';
import prismaClient from '../../../core/utils/prismadb';
import NotFoundException from '../../../core/exceptions/not-found';
import BadRequestException from '../../../core/exceptions/bad-requests';
import UnprocessableException from '../../../core/exceptions/unprocessable';
import { bulkCreateSchema, bulkDeleteSchema, IBulkCreateRequest, IRequest, schema } from './delcom.schema';
import { getUserConnected } from '../../../core/utils/authentificationService';
import { HTTPSTATUS } from '../../../config/http.config';
import { ErrorCode } from '../../../core/enums/error-code.enum';


const key = serviceType.AGENCY;

//-----------------------------------------------------------------------------
//             CREATE
//-----------------------------------------------------------------------------
export const create =
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await getUserConnected(req);

        const parsed = schema.parse(req.body as IRequest);

        const isAlready = await prismaClient.delcom.findFirst({ where: { name: parsed.name } });
        if (isAlready) {
            throw new UnprocessableException(null, "Duplicate name", ErrorCode.RESSOURCE_ALREADY_EXISTS);
        }

        const data = await prismaClient.delcom.create({
            data: {
                ...parsed,
                createdBy: user.id,
                updatedBy: user.id
            },
        });

        revalidateService(key);

        res.status(201).json({
            success: true,
            data
        });
    };


//-----------------------------------------------------------------------------
//             GET ALL
//-----------------------------------------------------------------------------
export const get =
    async (req: Request, res: Response, next: NextFunction) => {

        const redis_data = await redis.get(key);
        const data = (redis_data)
            ? JSON.parse(redis_data)
            : await revalidateService(key);

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

        const data = await prismaClient.delcom.findUnique({
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

        const parsed = schema.parse(req.body); // Validate input

        const data = await prismaClient.delcom.update({
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
        if (!id) throw new BadRequestException('Invalid params');

        await prismaClient.delcom.update({
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

        await prismaClient.delcom.delete({
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

    // Check for duplicate delcom names
    const existingRessources = await Promise.all(parsedData.data.map(async item => {
        return await prismaClient.delcom.findFirst({ where: { name: item.name } });
    }));

    const duplicates = existingRessources.filter(item => item);
    if (duplicates.length > 0) {
        return res.status(422).json({
            success: false,
            message: "Duplicate name found",
            duplicates: duplicates.map(item => item?.name)
        });
    }

    // Create delcoms
    const createdPaymentModes = await Promise.all(parsedData.data.map(item =>
        prismaClient.delcom.create({
            data: {
                ...item,
                createdBy: user.id,
                updatedBy: user.id,
            }
        })
    ));

    revalidateService(key);

    res.status(201).json({
        success: true,
        data: createdPaymentModes
    });

};

//-----------------------------------------------------------------------------
//             BULK-DELETE 
//-----------------------------------------------------------------------------
export const bulkRemove = async (req: Request, res: Response, next: NextFunction) => {

    // Validate input using Zod
    const { ids } = bulkDeleteSchema.parse(req.body);

    await prismaClient.delcom.deleteMany({
        where: {
            id: { in: ids } // Use 'in' to delete all matching IDs in one query
        }
    });

    revalidateService(key);

   res.status(HTTPSTATUS.NO_CONTENT).send(); // No content
};

const revalidateService = async (key: string) => {

    const data = await prismaClient.delcom.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            Region: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });

    // flatten the structure
    const formattedData = data.map(item => ({
        id: item.id,
        name: item.name,
        createdAt: item.createdAt,
        regionId: item.Region ? item.Region.id : null,
        region: item.Region ? item.Region.name : null,
    }));

    await redis.set(key, JSON.stringify(formattedData));

    return data
}