import { NextFunction, Request, Response } from 'express';

import { redis } from '../../../core/utils/redis';
import { serviceType } from '../../../constants/enum';
import prismaClient from '../../../core/utils/prismadb';
import { HTTPSTATUS } from '../../../config/http.config';
import { ErrorCode } from '../../../core/enums/error-code.enum';
import NotFoundException from '../../../core/exceptions/not-found';
import BadRequestException from '../../../core/exceptions/bad-requests';
import UnprocessableException from '../../../core/exceptions/unprocessable';
import { getUserConnected } from '../../../core/utils/authentificationService';
import { schema, bulkCreateSchema, bulkDeleteSchema, IRequest, IBulkCreateRequest } from './region.schema';


const key = serviceType.REGION;

//-----------------------------------------------------------------------------
//             CREATE 
//-----------------------------------------------------------------------------
export const create =
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await getUserConnected(req);

        const parsed = schema.parse(req.body as IRequest);

        const isAlready = await prismaClient.region.findFirst({ where: { name: parsed.name } });
        if (isAlready) {
            throw new UnprocessableException(null, "Duplicate name", ErrorCode.RESSOURCE_ALREADY_EXISTS);
        }

        const data = await prismaClient.region.create({
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
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const data = await prismaClient.region.findUnique({
            where: {
                id,
                deleted: false
            },
        });
        if (!data) throw new NotFoundException("Item not found", ErrorCode.RESOURCE_NOT_FOUND);

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
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const parsed = schema.parse(req.body);

        const data = await prismaClient.region.update({
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

        await prismaClient.region.update({
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
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        await prismaClient.region.delete({
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

    const parsedData = bulkCreateSchema.parse(req.body as IBulkCreateRequest);

    // Check for duplicate region names
    const existingRessources = await Promise.all(parsedData.data.map(async item => {
        return await prismaClient.region.findFirst({ where: { name: item.name } });
    }));

    const duplicates = existingRessources.filter(item => item);
    if (duplicates.length > 0) {
        return res.status(422).json({
            success: false,
            message: "Duplicate name found",
            duplicates: duplicates.map(item => item?.name)
        });
    }

    // Create region
    const createdPaymentModes = await Promise.all(parsedData.data.map(region =>
        prismaClient.region.create({
            data: {
                ...region,
                createdBy: user.id,
                updatedBy: user.id
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
    const user = await getUserConnected(req);

    const { ids } = bulkDeleteSchema.parse(req.body);

    await prismaClient.region.updateMany({
        where: {
            id: { in: ids } // Use 'in' to update all matching IDs in one query
        },
        data: {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: user.id
        }
    });

    revalidateService(key);

   res.status(HTTPSTATUS.NO_CONTENT).send(); // No content
};


//-----------------------------------------------------------------------------
//             BULK-HARD-DELETE 
//-----------------------------------------------------------------------------
export const bulkHardRemove = async (req: Request, res: Response, next: NextFunction) => {

    const { ids } = bulkDeleteSchema.parse(req.body);

    await prismaClient.region.deleteMany({
        where: {
            id: { in: ids } // Use 'in' to delete all matching IDs in one query
        }
    });

    revalidateService(key);

   res.status(HTTPSTATUS.NO_CONTENT).send(); // No content
};

const revalidateService = async (key: string) => {

    const data = await prismaClient.region.findMany({
        where: {
            deleted: false
        },
        orderBy: {
            name: 'asc',
        },
    });

    await redis.set(key, JSON.stringify(data));

    return data
}