import { NextFunction, Request, Response } from 'express';

import { schema } from '../workflows.schemas';
import { redis } from '../../../core/utils/redis';
import { HTTPSTATUS } from '../../../config/http.config';
import prismaClient from '../../../core/utils/prismadb';
import { ErrorCode } from '../../../core/enums/error-code.enum';
import NotFoundException from '../../../core/exceptions/not-found';
import BadRequestException from '../../../core/exceptions/bad-requests';
import UnauthorizedException from '../../../core/exceptions/unauthorized';
import UnprocessableException from '../../../core/exceptions/unprocessable';
import { getUserConnected } from '../../../core/utils/authentificationService';



//-----------------------------------------------------------------------------
//             CREATE workflow : post /workflows
//-----------------------------------------------------------------------------

// Handling create workflow process
export const create =
    async (req: Request, res: Response, next: NextFunction) => {
        // Validate input
        const parsedInput = schema.parse(req.body);
        // search if the name already exists
        const isAlready = await prismaClient.v_workflow.findFirst({ where: { name: parsedInput.name } });
        if (isAlready) throw new UnprocessableException("Duplicate setting name",req.body, ErrorCode.RESSOURCE_ALREADY_EXISTS);

        // Get the user connected
        const user = await getUserConnected(req);
        if (!user) throw new UnauthorizedException("Unauthorize ressource", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);

        // Create workflow
        const data = await prismaClient.workflow.create({
            data: {
                ...parsedInput,
                isActive: true,
                createdBy: user.id,
                updatedBy: user.id,
            },
        });

        res.status(201).json({
            success: true,
            data
        });
    };


//-----------------------------------------------------------------------------
//             GET ALL workflow :  get /workflows
//-----------------------------------------------------------------------------

// Handling the process GET workflows 

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
        const totalItems = await prismaClient.v_workflow.count({
            where: combinedWhereClause,
        });

        // Fetch paginated records
        const data = await prismaClient.v_workflow.findMany({
            where: combinedWhereClause,
            orderBy: { createdAt: 'desc' },
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
//             GET workflow BY ID : get /workflows/:id
//-----------------------------------------------------------------------------

// Handling the process GET workflow by ID 
export const getById =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const data = await prismaClient.v_workflow.findUnique({
            where: { id: id },
        });
        if (!data) throw new NotFoundException("Customer reference not found", ErrorCode.RESOURCE_NOT_FOUND);

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };

//-----------------------------------------------------------------------------
//             UPDATE workflow : put  /workflows/:id
//-----------------------------------------------------------------------------

// Handling Update workflow process
export const update =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        // Get the user connected
        const user = await getUserConnected(req); 
        if (!user) throw new UnauthorizedException("Unauthorize ressource", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);

        const parsedData = req.body// workflowSchema.parse(req.body); // Validate input
        const data = await prismaClient.workflow.update({
            where: { id: id },
            data: { ...parsedData, updatedBy: user.id },
        });

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };


//-----------------------------------------------------------------------------
//             DELETE workflow : delete  /workflows/:id
//-----------------------------------------------------------------------------

// Handling delete workflow process
export const remove =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        // Get the user connected
        const user = await getUserConnected(req); 
        if (!user) throw new UnauthorizedException("Unauthorize ressource", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);


        await prismaClient.workflow.update({
            where: { id: id },
            data: {
                deleted: true,
                deletedBy: user.id,
                deletedAt: new Date(),
            },
        });

       res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

    };


//-----------------------------------------------------------------------------
//             BULK-CREATE workflow : post /workflows
//-----------------------------------------------------------------------------

interface IBulkCreate {
    data: { name: string }[];
}

// Handling create workflow process
export const bulkCreate = async (req: Request, res: Response, next: NextFunction) => {

    // Validate input
    const parsedData = req.body // bulkCreateSchema.parse(req.body as IBulkCreateRequest);

    // Check for duplicate workflow names
    const existingRessources = await Promise.all(parsedData.data.map(async (item:any) => {
        return await prismaClient.v_workflow.findFirst({ where: { name: item.name } });
    }));

    const duplicates = existingRessources.filter(item => item);
    if (duplicates.length > 0) {
        return res.status(422).json({
            success: false,
            message: "Duplicate setting names found",
            duplicates: duplicates.map(item => item?.name)
        });
    }

    // Create workflows
    const createdBanks = await Promise.all(parsedData.data.map((workflow:any) =>
        prismaClient.workflow.create({ data: workflow })
    ));


    res.status(201).json({
        success: true,
        data: createdBanks
    });

};

//-----------------------------------------------------------------------------
//             BULK-DELETE workflow : delete  /workflows/:id
//-----------------------------------------------------------------------------

interface IBulkDelete {
    data: { id: string }[];
}

// Handling bulk delete workflow process
export const bulkRemove = async (req: Request, res: Response, next: NextFunction) => {

    // Validate input using Zod
    const { ids } = req.body //bulkDeleteSchema.parse(req.body);

    // Perform bulk delete
    const deleteResult = await prismaClient.workflow.deleteMany({
        where: {
            id: { in: ids } // Use 'in' to delete all matching IDs in one query
        }
    });

    //revalidateService(key);

    // Send response
   res.status(HTTPSTATUS.NO_CONTENT).send(); // No content

};

// const revalidateService = async (key: string) => {
//     const data = await prismaClient.customerReference.findMany({
//         where: { deleted: false },
//         orderBy: {
//             createdAt: 'desc',
//         },
//     });

//     await redis.set(key, JSON.stringify(data));
//     return data
// }