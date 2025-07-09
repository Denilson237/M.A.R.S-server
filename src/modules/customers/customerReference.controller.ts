import { NextFunction, Request, Response } from 'express';

import { redis } from '../../core/utils/redis';
import prismaClient from '../../core/utils/prismadb';
import { HTTPSTATUS } from '../../config/http.config';
import { ErrorCode } from '../../core/enums/error-code.enum';
import NotFoundException from '../../core/exceptions/not-found';
import BadRequestException from '../../core/exceptions/bad-requests';
import UnauthorizedException from '../../core/exceptions/unauthorized';
import { serviceType } from '../../constants/enum';


const key = serviceType.CUSTOMER_REFERENCE;

//-----------------------------------------------------------------------------
//             CREATE 
//-----------------------------------------------------------------------------
export const create =
    async (req: Request, res: Response, next: NextFunction) => {
        // Validate input
        // const parsedBank = customers_referenceSchema.parse(req.body as typeof CustomerReference );
        // // search if the name already exists
        // const isAlready = await prismaClient.customers_reference.findFirst({ where: { name: parsedBank.name } });
        // if (isAlready) {
        //     throw new UnprocessableException(null, "Duplicate setting name", ErrorCode.RESSOURCE_ALREADY_EXISTS);
        // }
        // const data = await prismaClient.customers_reference.create({
        //     data: parsedBank,
        // });
        // revalidateService(key);

        // res.status(201).json({
        //     success: true,
        //     data
        // });
    };


//-----------------------------------------------------------------------------
//             GET ALL customers_reference :  get /customers_references
//-----------------------------------------------------------------------------

// Handling the process GET customers_references 
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
//             GET customers_reference BY ID : get /customers_references/:id
//-----------------------------------------------------------------------------

// Handling the process GET customers_reference by ID 
export const getById =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const data = await prismaClient.customerReference.findUnique({
            where: {
                id: id,
                deleted: false
            },
        });
        if (!data) throw new NotFoundException("Customer reference not found", ErrorCode.RESOURCE_NOT_FOUND);

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };

//-----------------------------------------------------------------------------
//             UPDATE customers_reference : put  /customers_references/:id
//-----------------------------------------------------------------------------

// Handling Update customers_reference process
export const update =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

         // get the user information
         const user = await prismaClient.user.findFirst({
            where: { id: req.user?.id },
        });
        if (!user) throw new UnauthorizedException("Unauthorize ressource", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);

        const parsedData = req.body// customers_referenceSchema.parse(req.body); // Validate input
        const data = await prismaClient.customerReference.update({
            where: { id: id },
            data: {...parsedData, updatedBy:user.id },
        });
        revalidateService(key);

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };


//-----------------------------------------------------------------------------
//             DELETE customers_reference : delete  /customers_references/:id
//-----------------------------------------------------------------------------

// Handling delete customers_reference process
export const remove =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        // get the user information
        const user = await prismaClient.user.findFirst({
            where: { id: req.user?.id },
        });
        if (!user) throw new UnauthorizedException("Unauthorize ressource", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
        await prismaClient.customerReference.update({
            where: { id: id },
            data: {
                deleted: true,
                deletedBy: user.id,
                deletedAt: new Date(),
            },
        });
        revalidateService(key);

       res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

    };


//-----------------------------------------------------------------------------
//             BULK-CREATE customers_reference : post /customers_references
//-----------------------------------------------------------------------------

// IBulkCreateRequest interface definition
interface IBulkCreateRequest {
    data: { name: string }[];
}

// Handling create customers_reference process
export const bulkCreate = async (req: Request, res: Response, next: NextFunction) => {

    // // Validate input
    // const parsedData = bulkCreateSchema.parse(req.body as IBulkCreateRequest);

    // // Check for duplicate customers_reference names
    // const existingRessources = await Promise.all(parsedData.data.map(async item => {
    //     return await prismaClient.customers_reference.findFirst({ where: { name: item.name } });
    // }));

    // const duplicates = existingRessources.filter(item => item);
    // if (duplicates.length > 0) {
    //     return res.status(422).json({
    //         success: false,
    //         message: "Duplicate setting names found",
    //         duplicates: duplicates.map(item => item?.name)
    //     });
    // }

    // // Create customers_references
    // const createdBanks = await Promise.all(parsedData.data.map(customers_reference =>
    //     prismaClient.customers_reference.create({ data: customers_reference })
    // ));

    // revalidateService(key);

    // res.status(201).json({
    //     success: true,
    //     data: createdBanks
    // });

};

//-----------------------------------------------------------------------------
//             BULK-DELETE customers_reference : delete  /customers_references/:id
//-----------------------------------------------------------------------------

// IBulkCreateRequest
interface IBulkDeleteRequest {
    data: { id: string }[];
}

// Handling bulk delete customers_reference process
export const bulkRemove = async (req: Request, res: Response, next: NextFunction) => {

    // // Validate input using Zod
    // const { ids } = bulkDeleteSchema.parse(req.body);

    // // Perform bulk delete
    // const deleteResult = await prismaClient.customers_reference.deleteMany({
    //     where: {
    //         id: { in: ids } // Use 'in' to delete all matching IDs in one query
    //     }
    // });

    // revalidateService(key);

    // // Send response
    //res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

};

const revalidateService = async (key: string) => {
    const data = await prismaClient.customerReference.findMany({
        where: { deleted: false },
        orderBy: {
            createdAt: 'desc',
        },
    });

    await redis.set(key, JSON.stringify(data));
    return data
}