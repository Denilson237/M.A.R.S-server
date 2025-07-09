import { NextFunction, Request, Response } from 'express';

import { redis } from '../../../core/utils/redis';
import prismaClient from '../../../core/utils/prismadb';
import NotFoundException from '../../../core/exceptions/not-found';
import { ErrorCode } from '../../../core/exceptions/http-exception';

import BadRequestException from '../../../core/exceptions/bad-requests';
import UnauthorizedException from '../../../core/exceptions/unauthorized';

const key = 'customer-not-remotely-readable';

//-----------------------------------------------------------------------------
//             CREATE customers_reference : post /customers_references
//-----------------------------------------------------------------------------


// Handling create customers_reference process
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
//             GET ALL CMS customers :  get /customers
//-----------------------------------------------------------------------------

// Handling the process GET customers
export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Extract and parse filters
        const filters = req.query.filters as string || '';
        let parsedFilters;

        try {
            parsedFilters = filters ? JSON.parse(filters) : {};
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format for filters. Please provide valid JSON.'
            });
        }

        const whereClause: any = [];

        // Function to create a Prisma filter from provided filter data
        const createFilter = ({ field, operator, value }: { field: string; operator: string; value: any }) => {
            if (!field || value === undefined) {
                throw new Error(`Each filter must include 'field' and 'value'.`);
            }

            const prismaOperatorMap: any = {
                contains: { contains: value },
                equals: { equals: value },
                gte: { gte: value },
                lte: { lte: value },
                gt: { gt: value },
                lt: { lt: value }
            };

            const prismaCondition = prismaOperatorMap[operator];
            if (!prismaCondition) {
                throw new Error(`Operator '${operator}' is not supported.`);
            }

            return { [field]: prismaCondition };
        };

        // Process conditions
        if (Array.isArray(parsedFilters.conditions)) {
            for (const condition of parsedFilters.conditions) {
                const { operator, filters: conditionFilters } = condition;

                if (!Array.isArray(conditionFilters) || !conditionFilters.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each condition must include an array of filters.'
                    });
                }

                const conditionObject = conditionFilters.map(createFilter);
                const combinedCondition = operator === 'AND' ? { AND: conditionObject } : { OR: conditionObject };
                whereClause.push(combinedCondition);
            }
        } else {
            // Process simple filters
            for (const key in parsedFilters) {
                const { operator = 'equals', value } = parsedFilters[key];
                whereClause.push(createFilter({ field: key, operator, value }));
            }
        }

        // Combine final where clause
        const combinedWhereClause = whereClause.length ? { AND: whereClause } : {};

        // Get the total count of records
        const totalItems = await prismaClient.t_import_clients_cms.count({
            where: combinedWhereClause,
        });

        // Fetch paginated records
        const data = await prismaClient.t_import_clients_cms.findMany({
            where: combinedWhereClause,
            orderBy: { SERVICE_NUMBER: 'asc' },
            skip,
            take: limit,
        });

        // Respond with data and pagination info
        res.status(HTTPSTATUS.OK).json({
            success: true,
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: errorMessage });
    }
};


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
//             GET customers_reference BY ID : get /customers_references/contracts/:id
//-----------------------------------------------------------------------------

// Handling the process GET customers_reference by ID 
export const getByContractNumber =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const serviceNumber = Number(id);

         // 1. Récupérer le client par son numéro de service
        const data = await prismaClient.t_import_clients_cms.findFirst({
            where: {
                SERVICE_NUMBER: serviceNumber,
            },
        });

        if (!data) throw new NotFoundException("Customer not found", ErrorCode.RESOURCE_NOT_FOUND);

        // 2. Récupérer le nombre de factures et le cumul du montant impayé
        const factureData = await prismaClient.t_import_factures_cms.aggregate({
            where: {
                SERVICE_NUMBER: serviceNumber,
            },
            _count: {
                NUMERO_FACTURE: true,
            },
            _sum: {
                MONTANT_IMPAYE_TTC: true,
            }
        });

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data : { 
                ...data, 
                NB_UNPAID_BILLS: factureData._count.NUMERO_FACTURE, 
                AMOUNT_UNPAID_BILLS: factureData._sum.MONTANT_IMPAYE_TTC ?? 0
            },
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
            data: { ...parsedData, updatedBy: user.id },
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
        await prismaClient.transaction.update({
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