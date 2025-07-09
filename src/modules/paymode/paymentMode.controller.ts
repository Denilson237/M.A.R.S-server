import { NextFunction, Request, Response } from 'express';

import { redis } from '../../core/utils/redis';
import { serviceType } from '../../constants/enum';
import prismaClient from '../../core/utils/prismadb';
import { HTTPSTATUS } from '../../config/http.config';
import { ErrorCode } from '../../core/enums/error-code.enum';
import NotFoundException from '../../core/exceptions/not-found';
import BadRequestException from '../../core/exceptions/bad-requests';
import UnprocessableException from '../../core/exceptions/unprocessable';
import { getUserConnected } from '../../core/utils/authentificationService';
import { paymentModeSchema, bulkCreateSchema, bulkDeleteSchema, IPaymentModeRequest, IBulkCreateRequest } from './paymentModes.schema';



const key = serviceType.PAYMODE;

//-----------------------------------------------------------------------------
//             CREATE 
//-----------------------------------------------------------------------------
export const create =
    async (req: Request, res: Response, next: NextFunction) => {

        const user = await getUserConnected(req);

        const parsed = paymentModeSchema.parse(req.body as IPaymentModeRequest);

        const isAlready = await prismaClient.paymentMode.findFirst({ where: { name: parsed.name } });
        if (isAlready) {
            throw new UnprocessableException(null, "Duplicate setting name", ErrorCode.RESSOURCE_ALREADY_EXISTS);
        }

        const data = await prismaClient.paymentMode.create({
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

        const data = await prismaClient.paymentMode.findUnique({
            where: {
                id: id,
                deleted: false
            },
        });
        if (!data) throw new NotFoundException("PaymentMode not found", ErrorCode.RESOURCE_NOT_FOUND);

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
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const user = await getUserConnected(req);
        const parsedPaymentMode = paymentModeSchema.parse(req.body);

        const data = await prismaClient.paymentMode.update({
            where: { id: id },
            data: {
                ...parsedPaymentMode,
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

        await prismaClient.paymentMode.update({
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
//             HARD-DELETE 
//-----------------------------------------------------------------------------
export const HardRemove =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        await prismaClient.paymentMode.delete({
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

    // Check for duplicate paymentMode names
    const existingRessources = await Promise.all(parsedData.data.map(async item => {
        return await prismaClient.paymentMode.findFirst({ where: { name: item.name } });
    }));

    const duplicates = existingRessources.filter(item => item);
    if (duplicates.length > 0) {
        return res.status(422).json({
            success: false,
            message: "Duplicate setting names found",
            duplicates: duplicates.map(item => item?.name)
        });
    }

    // Create paymentModes
    const createdPaymentModes = await Promise.all(parsedData.data.map(paymentMode =>
        prismaClient.paymentMode.create({
            data: {
                ...paymentMode,
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

    await prismaClient.paymentMode.updateMany({
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

    await prismaClient.paymentMode.deleteMany({
        where: {
            id: { in: ids } // Use 'in' to delete all matching IDs in one query
        }
    });

    revalidateService(key);

   res.status(HTTPSTATUS.NO_CONTENT).send(); // No content
};



const revalidateService = async (key: string) => {
    const data = await prismaClient.paymentMode.findMany({
        orderBy: {
            name: 'asc',
        },
    });
    await redis.set(key, JSON.stringify(data));
    return data
}