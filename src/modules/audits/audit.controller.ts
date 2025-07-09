import { NextFunction, Request, Response } from 'express';

import { serviceType } from '../../constants/enum';
import prismaClient from '../../core/utils/prismadb';
import { HTTPSTATUS } from '../../config/http.config';
import { ErrorCode } from '../../core/enums/error-code.enum';
import NotFoundException from '../../core/exceptions/not-found';
import BadRequestException from '../../core/exceptions/bad-requests';


const key = serviceType.AUDIT;

//-----------------------------------------------------------------------------
//             GET ALL 
//-----------------------------------------------------------------------------
export const get = async (req: Request, res: Response, next: NextFunction) => {

    // Fetch the paginated audit records, ordered by name
    const data = await prismaClient.v_audits.findMany({
        orderBy: {
            createdAt: 'desc',
        }
    });

    // Respond with the retrieved data and pagination information
    res.status(HTTPSTATUS.OK).json({
        success: true,
        data
    });

};


export const getWithPaginationFeature = async (req: Request, res: Response, next: NextFunction) => {
    // Extracting pagination parameters from the query string
    const page = parseInt(req.query.page as string) || 1; // Default page is 1
    const limit = parseInt(req.query.limit as string) || 10; // Default limit is 10
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    // Get the total count of audit records
    const totalItems = await prismaClient.v_audits.count();

    // Fetch the paginated audit records, ordered by name
    const data = await prismaClient.v_audits.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        skip: skip,
        take: limit,
    });

    // Respond with the retrieved data and pagination information
    res.status(HTTPSTATUS.OK).json({
        success: true,
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit), // Calculate total pages
        currentPage: page, // Current page number
    });

};


export const getWithPaginationAndFilterFeature = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extracting pagination parameters from the query string
        const page = parseInt(req.query.page as string) || 1; // Default page is 1
        const limit = parseInt(req.query.limit as string) || 10; // Default limit is 10
        const skip = (page - 1) * limit; // Calculate the number of records to skip

        // Extract filter criteria from the query string
        const filters = req.query.filters as string || ''; // Expecting a JSON string of filters

        // Validate that filters is a valid JSON
        let parsedFilters: { [key: string]: { operator: string, value: any } } = {};
        try {
            parsedFilters = filters ? JSON.parse(filters) : {};
        } catch (error) {
            return res.status(HTTPSTATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid JSON format for filters. Please provide valid JSON.'
            });
        }

        // Validate the filter input
        const whereClause: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(parsedFilters)) {
            // Check if filterValue is provided
            if (!value.value) {
                return res.status(400).json({
                    success: false,
                    message: `Filter for ${key} is not properly defined. It must include both 'operator' and 'value'.`
                });
            }

            // Build the where clause based on the filters
            const operator = value.operator || 'equals';
            const filterValue = value.value;

            switch (operator) {
                case 'contains':
                    whereClause[key] = { contains: filterValue, mode: 'insensitive' };
                    break;
                case 'equals':
                    whereClause[key] = { equals: filterValue };
                    break;
                case 'gte':
                    whereClause[key] = { gte: filterValue };
                    break;
                case 'lte':
                    whereClause[key] = { lte: filterValue };
                    break;
                case 'gt':
                    whereClause[key] = { gt: filterValue };
                    break;
                case 'lt':
                    whereClause[key] = { lt: filterValue };
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: `Operator '${operator}' for filter on ${key} is not supported.`
                    });
            }
        }

        // Get the total count of audit records with dynamic filtering
        const totalItems = await prismaClient.v_audits.count({
            where: whereClause,
        });

        // Fetch the paginated audit records with dynamic filtering
        const data = await prismaClient.v_audits.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            skip: skip,
            take: limit,
        });

        // Respond with the retrieved data and pagination information
        res.status(HTTPSTATUS.OK).json({
            success: true,
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit), // Calculate total pages
            currentPage: page, // Current page number
        });
    } catch (error) {
        console.error(error);
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
};


export const getWithPaginationAndComplexeFilterFeature = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extracting pagination parameters from the query string
        const page = parseInt(req.query.page as string) || 1; // Default page is 1
        const limit = parseInt(req.query.limit as string) || 10; // Default limit is 10
        const skip = (page - 1) * limit; // Calculate the number of records to skip

        // Extract filter criteria from the query string
        const filters = req.query.filters as string || ''; // Expecting a JSON string of filters

        // Validate that filters is a valid JSON
        let parsedFilters;
        try {
            parsedFilters = filters ? JSON.parse(filters) : {};
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format for filters. Please provide valid JSON.'
            });
        }

        // Initialize the where clause for Prisma
        const whereClause = [];

        // Check if conditions are provided
        if (Array.isArray(parsedFilters.conditions)) {
            for (const condition of parsedFilters.conditions) {
                const { operator, filters: conditionFilters } = condition;

                // Validate the filters within the condition
                if (!Array.isArray(conditionFilters) || conditionFilters.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each condition must include an array of filters.'
                    });
                }

                // Create the condition object
                const conditionObject = conditionFilters.map(filter => {
                    const { field, operator, value } = filter;
                    if (!field || value === undefined) {
                        return res.status(400).json({
                            success: false,
                            message: `Each filter must include 'field' and 'value'.`
                        });
                    }

                    // Map operator to Prisma query
                    switch (operator) {
                        case 'contains':
                            return { [field]: { contains: value, mode: 'insensitive' } };
                        case 'equals':
                            return { [field]: { equals: value } };
                        case 'gte':
                            return { [field]: { gte: value } };
                        case 'lte':
                            return { [field]: { lte: value } };
                        case 'gt':
                            return { [field]: { gt: value } };
                        case 'lt':
                            return { [field]: { lt: value } };
                        default:
                            return res.status(400).json({
                                success: false,
                                message: `Operator '${operator}' is not supported.`
                            });
                    }
                });

                // Combine the conditions using AND or OR
                if (operator === 'AND') {
                    whereClause.push({ AND: conditionObject });
                } else if (operator === 'OR') {
                    whereClause.push({ OR: conditionObject });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: `Condition operator '${operator}' is not supported. Use 'AND' or 'OR'.`
                    });
                }
            }
        } else {
            // Simple filter case
            for (const key in parsedFilters) {
                const { operator, value } = parsedFilters[key];
                const condition = {
                    field: key,
                    operator: operator || 'equals', // Default to 'equals' if operator not provided
                    value: value
                };
                whereClause.push(condition);
            }
        }

        // Convert simple filters into Prisma-compatible where clause
        const finalWhereClause = whereClause.map(condition => {
            if ('field' in condition) {
                const { field, operator, value } = condition;

                switch (operator) {
                    case 'contains':
                        return { [field]: { contains: value } };
                    case 'equals':
                        return { [field]: { equals: value } };
                    case 'gte':
                        return { [field]: { gte: value } };
                    case 'lte':
                        return { [field]: { lte: value } };
                    case 'gt':
                        return { [field]: { gt: value } };
                    case 'lt':
                        return { [field]: { lt: value } };
                    default:
                        return null;
                }
            }
            return null;
        }).filter((condition): condition is NonNullable<typeof condition> => condition !== null); // Remove nulls

        // Combine final conditions into the final where clause
        const combinedWhereClause = finalWhereClause.length > 0 ? { AND: finalWhereClause } : {};

        // Get the total count of audit records with dynamic filtering
        const totalItems = await prismaClient.v_audits.count({
            where: combinedWhereClause,
        });

        // Fetch the paginated audit records with dynamic filtering
        const data = await prismaClient.v_audits.findMany({
            where: combinedWhereClause,
            orderBy: {
                createdAt: 'desc',
            },
            skip: skip,
            take: limit,
        });

        // Respond with the retrieved data and pagination information
        res.status(HTTPSTATUS.OK).json({
            success: true,
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit), // Calculate total pages
            currentPage: page, // Current page number
        });
    } catch (error) {
        console.error(error);
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
};


export const getWithPaginationAndComplexeFilterFeatureOptimizeForPrisma = async (req: Request, res: Response, next: NextFunction) => {
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
        const totalItems = await prismaClient.v_audits.count({
            where: combinedWhereClause,
        });

        // Fetch paginated records
        const data = await prismaClient.v_audits.findMany({
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
//             GET AUDIT BY ID : get /audits/:id
//-----------------------------------------------------------------------------

// Handling the process GET AUDIT by ID 
export const getById =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const data = await prismaClient.v_audits.findUnique({
            where: { id: parseInt(id) },
        });
        if (!data) throw new NotFoundException("Audit entry not found", ErrorCode.RESOURCE_NOT_FOUND);

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };




