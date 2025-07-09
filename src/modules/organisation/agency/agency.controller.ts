import { NextFunction, Request, Response } from 'express';

import { redis } from '../../../core/utils/redis';
import { serviceType } from '../../../constants/enum';
import prismaClient from '../../../core/utils/prismadb';
import { HTTPSTATUS } from '../../../config/http.config';
import NotFoundException from '../../../core/exceptions/not-found';
import BadRequestException from '../../../core/exceptions/bad-requests';
import UnprocessableException from '../../../core/exceptions/unprocessable';
import { getUserConnected } from '../../../core/utils/authentificationService';
import { bulkCreateSchema, bulkDeleteSchema, IBulkCreateRequest, IRequest, schema } from './agency.schema';
import { ErrorCode } from '../../../core/enums/error-code.enum';


const key = serviceType.AGENCY;

//-----------------------------------------------------------------------------
//             CREATE 
//-----------------------------------------------------------------------------
export const create =
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await getUserConnected(req);

        const parsed = schema.parse(req.body as IRequest);

        const isAlready = await prismaClient.agency.findFirst({ where: { name: parsed.name } });
        if (isAlready) {
            throw new UnprocessableException("Duplicate name", ErrorCode.RESSOURCE_ALREADY_EXISTS);
        }

        const data = await prismaClient.agency.create({
            data: {
                ...parsed,
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

        const data = await prismaClient.agency.findUnique({
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

        const data = await prismaClient.agency.update({
            where: { id: id },
            data: {
                ...parsed,
                updatedBy:user.id,
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

        await prismaClient.agency.update({
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

        await prismaClient.agency.delete({
            where: { id: id },
        });

        revalidateService(key);

       res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

    };


//-----------------------------------------------------------------------------
//             BULK-CREATE 
//-----------------------------------------------------------------------------

// IBulkCreateRequest interface definition


// Handling create agency process
export const bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
     const user = await getUserConnected(req);
    // Validate input
    const parsedData = bulkCreateSchema.parse(req.body as IBulkCreateRequest);

    // Check for duplicate agency names
    const existingRessources = await Promise.all(parsedData.data.map(async item => {
        return await prismaClient.agency.findFirst({ where: { name: item.name } });
    }));

    const duplicates = existingRessources.filter(item => item);
    if (duplicates.length > 0) {
        return res.status(422).json({
            success: false,
            message: "Duplicate name found",
            duplicates: duplicates.map(item => item?.name)
        });
    }

    // Create agencys
    const createdPaymentModes = await Promise.all(parsedData.data.map(agency =>
        prismaClient.agency.create({ data: {...agency,
            createdBy: user.id,
            updatedBy: user.id
        } })
    ));

    revalidateService(key);

    res.status(201).json({
        success: true,
        data: createdPaymentModes
    });

};

//-----------------------------------------------------------------------------
//             BULK-DELETE : delete  /agencys/:id
//-----------------------------------------------------------------------------

// IBulkCreateRequest
interface IBulkDeleteRequest {
    data: { id: string }[];
}

// Handling bulk delete agency process
export const bulkRemove = async (req: Request, res: Response, next: NextFunction) => {

    // Validate input using Zod
    const { ids } = bulkDeleteSchema.parse(req.body);

    // Perform bulk delete
    const deleteResult = await prismaClient.agency.deleteMany({
        where: {
            id: { in: ids } // Use 'in' to delete all matching IDs in one query
        }
    });

    revalidateService(key);

    // Send response
   res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

};

const revalidateService = async (key: string) => {

    const data = await prismaClient.agency.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            Delcom: {
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
    const formattedData = data.map(agency => ({
        id: agency.id,
        name: agency.name,
        createdAt: agency.createdAt,
        regionId: agency.Delcom ? agency.Delcom.id : null,
        region: agency.Delcom ? agency.Delcom.name : null,
    }));

    await redis.set(key, JSON.stringify(formattedData));

    return data
}