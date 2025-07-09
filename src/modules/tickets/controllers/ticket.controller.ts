import { NextFunction, Request, Response } from "express";
import { E_NotificationMethod as NotificationMethod, E_SourceType as SourceType, E_TicketStatus as TicketStatus } from '@prisma/client';

import { redis } from "../../../core/utils/redis";
import prismaClient from "../../../core/utils/prismadb";
import { REDIS_SESSION_EXPIRE } from "../../../secrets";
import { HTTPSTATUS } from "../../../config/http.config";
import NotFoundException from "../../../core/exceptions/not-found";
import BadRequestException from "../../../core/exceptions/bad-requests";
import UnauthorizedException from "../../../core/exceptions/unauthorized";
import ConfigurationException from "../../../core/exceptions/configuration";
import { getUserConnected } from "../../../core/utils/authentificationService";
import { createSchema, idSchema, IRequest } from "../ticket.schemas";
import { serviceType, trackingService } from "../../../constants/enum";



// Redis key
const key = serviceType.TICKET;

type notificationType = "edit" | "publish" | "reject" | "validate" | "assign" | "submit";


//-----------------------------------------------------------------------------
//             CREATE
//-----------------------------------------------------------------------------
export const create =
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserConnected(req);
    
    // Validate the incoming request data using the defined schema
    const parsed = createSchema.parse(req.body as IRequest);

    // Valide the SERVICE_NUMBER
    const customer = await prismaClient.t_import_clients_cms.findUnique({
      where: {
        SERVICE_NUMBER: parseInt(parsed.contractNumber),
      },
    });
    if (!customer) throw new BadRequestException("Bad request invalidate SERVICE_NUMBER");


    const exist = await prismaClient.ticket.findFirst({
      where: {
        reference: parsed.contractNumber,
        typeId: parsed.type,
        status: {
          in: [TicketStatus.NEW, TicketStatus.PENDING_WORKFLOW_VALIDATION, TicketStatus.APPROVED, TicketStatus.IN_PROCESSING],
        },
      },
    });
    if (exist) throw new BadRequestException("This resquest already exists");

    // Création du ticket 
    const result = await prismaClient.ticket.create({
      data: {
        reference: parsed.contractNumber,
        reasonId: parsed.reasonId,
        status: TicketStatus.NEW,
        typeId: parsed.type,
        createdBy: user.id,
        updatedBy: user.id
      },
    });

    // Revalidate associated services after creating the transaction
    revalidateService(key);

    // Création de l'historique
    //   await prismaClient.ticketHistory.create({
    //     data: {
    //         ticketId: result.id,
    //         toStepId: initialStep.id,
    //         action: "TICKET_CREATED",
    //         createdBy: user.id
    //     }
    // });

    // Respond with the details of the created transaction
    res.status(201).json({
      success: true,
      data: result,
    });

    // Log an audit entry for tracking user actions
    await prismaClient.audit.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        action: trackingService.TICKET.CREATE,
        details: `User : ${user.username} created a new ticket : reference ${parsed.contractNumber} `,
        endpoint: '/assignments',
        source: SourceType.USER
      },
    });
  };


//-----------------------------------------------------------------------------
//             GET ALL 
//-----------------------------------------------------------------------------

// Handling get process   
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
    const totalItems = await prismaClient.v_tickets.count({
      where: combinedWhereClause,
    });

    // Fetch paginated records
    const data = await prismaClient.v_tickets.findMany({
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
//             GET ALL MY assignments :  get /assignments/me
//-----------------------------------------------------------------------------

// Handling get process   
export const getMy = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Retrieve the connected user for audit and notification purposes 
    const user = await getUserConnected(req);


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
    // const combinedWhereClause = whereClause.length ? { AND: whereClause } : {};
    // Combine final where clause with userId filter
    const combinedWhereClause = {
      AND: [
        { createdBy: user.id }, // Filter by userId
        ...whereClause
      ]
    };

    // Get the total count of records
    const totalItems = await prismaClient.v_tickets.count({
      where: combinedWhereClause,
    });

    // Fetch paginated records
    const data = await prismaClient.v_tickets.findMany({
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
//             GET ALL MY assignments :  get /assignments/pending
//-----------------------------------------------------------------------------

// Handling get process   
export const getPending = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Retrieve the connected user for audit and notification purposes 
    const user = await getUserConnected(req);

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

    const userAndUserRoleBasedCondition = {
      OR: [
        {
          AND: [
            { validatorId: user.id },
            { validatorRoleId: user.role.id }
          ]
        },
        { validatorUId: user.id }
      ]
    };

    // Combine final where clause
    // const combinedWhereClause = whereClause.length ? { AND: whereClause } : {};
    // Combine final where clause with userId filter
    const combinedWhereClause = {
      AND: [
        { status: TicketStatus.PENDING_WORKFLOW_VALIDATION },
        userAndUserRoleBasedCondition, // Filter by userId
        ...whereClause
      ]
    };

    // Get the total count of records
    const totalItems = await prismaClient.v_ticket_with_validator.count({
      where: combinedWhereClause,
    });

    // Fetch paginated records
    const data = await prismaClient.v_ticket_with_validator.findMany({
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
//             GET assignments BY ID : get /assignments/:id
//-----------------------------------------------------------------------------

// Handling the process GET transaction by ID 
export const getById =
  async (req: Request, res: Response, next: NextFunction) => {

    // Extract the 'id' parameter from the request
    const id = req.params.id;

    if (!id) throw new BadRequestException('Invalid params')

    // Validate the provided ID using the idSchema
    const validatedId = idSchema.parse(id);
    if (!validatedId) throw new BadRequestException('Invalid params')


    const data = await prismaClient.v_ticket.findUnique({
      where: { id: validatedId },
    });

    // Respond with the retrieved data, converting the amount to a string for consistency
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: data
    });
  };


//-----------------------------------------------------------------------------
//             UPDATE 
//-----------------------------------------------------------------------------
// Handling Update transaction process
export const update =
  async (req: Request, res: Response, next: NextFunction) => {

    // Retrieve user information for authorization checks
    const user = await getUserConnected(req);

    // Extract the 'id' parameter from the request
    const id = req.params.id;

    // Validate the 'id' parameter; if it's missing, throw a BadRequestException
    if (!id) throw new BadRequestException('Invalid params')

    // Validate the provided ID using the idSchema
    const validatedId = idSchema.parse(id);
    if (!validatedId) throw new BadRequestException('Invalid params')

    // Initialize notification type for tracking
    let notificationType: notificationType = "edit";

    // Define forbidden fields that should not be included in the request body
    const forbiddenFields = [
      'id', 'createdAt', 'createdBy',
      'modifiedBy', 'deleted', 'deletedBy',
      'deletedAt'
    ];

    // Check for forbidden fields in the request body
    for (const field of forbiddenFields) {
      if (req.body[field]) {
        throw new UnauthorizedException("Unauthorized resource");
      }
    }

    const data = await prismaClient.ticket.update({
      where: { id: validatedId },
      data: req.body,
    });


    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Resource updated successfully",
      data
    });

    // Notify the user about the event based on the notification type
    notification(notificationType, data, user)

    // Log an audit entry for tracking user actions
    await prismaClient.audit.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        action: trackingService.TICKET.UPDATE,
        details: `User: ${user.username} has updated the assignment request ID: ${id}. change value: ${JSON.stringify(data)}`,
        endpoint: '/assignments',
        source: SourceType.USER
      },
    });
  };


//-----------------------------------------------------------------------------
//             DELETE 
//-----------------------------------------------------------------------------
export const remove =
  async (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id;

    if (!id) throw new BadRequestException('Invalid params')

    id = idSchema.parse(id);

    const data = await prismaClient.ticket.delete({
      where: { id: id },
    });
    await redis.del(id);
    revalidateService(key);

   res.status(HTTPSTATUS.NO_CONTENT).send();

    const user = await getUserConnected(req);
    // Audit entry for tracking purpose
    await prismaClient.audit.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        action: trackingService.TICKET.DELETE,
        details: `User : ${user.username} has deleted assignment resquest  ID ${JSON.stringify(data)}: details ${JSON.stringify(data)}`,
        endpoint: '/assignments',
        source: SourceType.USER
      },
    });
  };


//-----------------------------------------------------------------------------
//             SOFT-DELETE assignments : delete  /assignments/:id
//-----------------------------------------------------------------------------

// Handling delete process
export const softRemove =
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) throw new BadRequestException('Invalid params')

    const request = await prismaClient.ticket.findUnique({
      where: { id: idSchema.parse(id) },
    });
    if (!request) throw new NotFoundException("ressource not found");

    // get the user information
    const user = await prismaClient.user.findFirst({
      where: { id: req.user?.id },
    });
    if (!user) throw new UnauthorizedException("Unauthorize ressource");


    await prismaClient.ticket.update({
      where: { id: id },
      data: {
        deleted: true,
        deletedBy: user.id,
        deletedAt: new Date(),
      },
    });

    await redis.del(id);
    revalidateService(key);

   res.status(HTTPSTATUS.NO_CONTENT).send();

    // Audit entry for tracking purpose
    await prismaClient.audit.create({
      data: {
        userId: user.id,
        ipAddress: req.ip,
        action: trackingService.TICKET.DELETE,
        details: `User : ${user.username} has deleted Transaction : ${JSON.stringify(id)}`,
        endpoint: '/assignments',
        source: SourceType.USER
      },
    });

  };


//-----------------------------------------------------------------------------
//             BULK-CREATE
//-----------------------------------------------------------------------------
export const bulkCreate =
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate that the request body is an array
    const requests = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      throw new BadRequestException("Request body must be a non-empty array");
    }

    // const parsedData = bulkCreateSchema.parse(req.body as IBulkCreateRequest);
    // get the user information
    const user = await prismaClient.user.findFirst({
      where: { id: req.user?.id },
    });
    if (!user) throw new UnauthorizedException("Unauthorize ressource");



    const validRequests = [];
    // Validate each request
    for (const requestData of requests) {
      const { name, amount, bank, branch, mode, payment_date } = requestData;
      // Validate required fields for each request
      if (!name || !amount || !bank || !branch || !payment_date) {
        throw new BadRequestException("All fields (payment_date, name, amount, bank , branch) are required for each request");
      }

      const bankData = await prismaClient.bank.findFirst({
        where: { id: bank }
      });
      if (!bankData) throw new ConfigurationException("bankData not found, please contact adminstrator");

      const branchData = await prismaClient.bankAgency.findFirst({
        where: { id: branch }
      });
      if (!branchData) throw new ConfigurationException("Branch Data not found, please contact adminstrator");

      const payMode = await prismaClient.paymentMode.findFirst({
        where: { id: mode }
      });
      if (!payMode) throw new ConfigurationException("Payment mode not found, please contact adminstrator");


      // Generate a unique reference if it's not provided
      const data = //assignmentschema.parse
        ({
          // reference: uniqueReference.reference,
          name,
          amount,
          bankId: bankData.id,
          branchId: branchData.id,
          paymentDate: "",//parseDMY(payment_date),
          paymentModeId: payMode.id,
          createdBy: user.id,
          modifiedBy: user.id,
          userId: user.id,
          statusId: 2

        })
      validRequests.push(data);
    }

    // Insert all valid requests into the database
    //const createdRequests = await prismaClient.ticket.createMany({ data: validRequests });

    res.status(201).json({
      success: true,
      //data: createdRequests,
    });

  };


//---------------------------------------------------------
//            SOFT BULK DELETE REQUEST
//---------------------------------------------------------

// Handling soft delete process
export const bulkSoftRemove =
  async (req: Request, res: Response, next: NextFunction) => {

    let ids = req.body.ids; // Supposons que les IDs sont passés dans le corps de la requête

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Invalid params: IDs are required');
    }

    ids = ids.map((id: string) => idSchema.parse(id));

    // Vérifiez si les requêtes existent
    const requests = await prismaClient.ticket.findMany({
      where: { id: { in: ids } },
    });

    if (requests.length !== ids.length) {
      throw new BadRequestException('Invalid params: Some assignments not found');
    }

    // Supprimez les assignments en masse
    await prismaClient.ticket.deleteMany({
      where: { id: { in: ids } },
    });

    // Supprimez les entrées correspondantes du cache Redis
    await Promise.all(ids.map((item: string) => redis.del(item)));

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "assignments deleted successfully",
    });

  }


const idService = async (id: string) => {

  // Query the database for the transaction
  const data = await prismaClient.v_tickets.findUnique({
    where: { id: id },
  });

  // Store the retrieved data in Redis for caching
  await redis.set(
    id,
    JSON.stringify(data),
    "EX",
    REDIS_SESSION_EXPIRE
  );

  return data
}

const revalidateService = async (key: string) => {
  const data = await prismaClient.ticket.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  await redis.set(key, JSON.stringify(data));
  return data
}



/**
 * Sends notifications to users based on the type of event that occurred.
 *
 * This function handles various notification types such as publish, reject, validate, assign,
 * and verification. It communicates relevant information to the involved users via email.
 *
 * @param {notificationType} type - The type of notification to send (e.g., "publish", "validate", "reject").
 * @param {any} transaction - The transaction object containing relevant details like reference ID and creator information.
 * @param {any} user - The user associated with the transaction, used to determine the recipient of the notification.
 *
 * @returns void - A promise that resolves when notifications have been sent.
 */
async function notification(type: notificationType, transaction: any, user: any) {
  let createdBy;
  // Check the notification type
  switch (type) {
    case "publish":
      // Handle publish case Notified the user and notified all validator
      // user
      await prismaClient.notification.create({
        data: {
          email: user.email,
          message: `Your transaction ID : ${transaction.reference} has been published and is currently undergoing validation.`,
          method: NotificationMethod.EMAIL,
          subject: "New published transaction",
          template: "notification.mail.ejs",
        },
      });
           // TODO
      // validators
      // const validadors = await getUsersWithRole();
      // for (const validador of validadors) {
      //   await prismaClient.notification.create({
      //     data: {
      //       email: validador.email,
      //       message: `You have a new transaction that requires your attention for validation. Transaction ID: ${transaction.reference} Please review it at your earliest convenience.`,
      //       method: NotificationMethod.EMAIL,
      //       subject: " New Transaction Awaiting Your Validation",
      //       template: "notification.mail.ejs",
      //     },
      //   });
      // }

      break;
    case "reject":
      // Handle reject case and notified the person who created the assignments
      createdBy = await prismaClient.user.findFirst({
        where: { id: transaction.createdBy }
      })
      // if (createdBy) {
      //   await prismaClient.notification.create({
      //     data: {
      //       email: createdBy.email,
      //       message: `Your transaction ID: ${transaction.reference} has been rejected.`,
      //       method: NotificationMethod.EMAIL,
      //       subject: "Transaction Rejected",
      //       template: "notification.mail.ejs",
      //     },
      //   });
      // }

      break;
    case "validate":
      // Handle validate case and notify the person who created the transaction and all assignators
      createdBy = await prismaClient.user.findFirst({
        where: { id: transaction.createdBy },
      });
      // if (createdBy) {
      //   await prismaClient.notification.create({
      //     data: {
      //       email: createdBy.email,
      //       message: `Your transaction ID: ${transaction.reference} has been validated ,and is undergoing assignation process.`,
      //       method: NotificationMethod.EMAIL,
      //       subject: "Transaction Validated",
      //       template: "notification.mail.ejs",
      //     },
      //   });
      // }
      // assignators
      // const assignators = await getUsersWithRole('ASSIGNATOR');
      // for (const assignator of assignators) {
      //   await prismaClient.notification.create({
      //     data: {
      //       email: assignator.email,
      //       message: `You have a new transaction that requires an assignation. Transaction ID: ${transaction.reference} Please review it at your earliest convenience.`,
      //       method: NotificationMethod.EMAIL,
      //       subject: " New Transaction Awaiting An Assignation",
      //       template: "notification.mail.ejs",
      //     },
      //   });
      // }
      break;
    case "assign":
      // Handle assign case and notify the person who created the transaction
      // TODO
      // const assignCreator = await prismaClient.user.findFirst({
      //   where: { id: transaction.userId },
      // });
      // if (assignCreator) {
      //   await prismaClient.notification.create({
      //     data: {
      //       email: assignCreator.email,
      //       message: `Transaction ID: ${transaction.reference} has been assigned to you and need your commercial input.`,
      //       method: NotificationMethod.EMAIL,
      //       subject: "Transaction Assigned",
      //       template: "notification.mail.ejs",
      //     },
      //   });
      // }
      break;

    default:
      console.log("Notification type", type) // TODO ajouter le cas in process (Personne a notifié ??)
    //throw new Error("Invalid notification type");
  }


}

type role = "VALIDATOR" | "ASSIGNATOR"
const getUsersWithRole = async (role: string = "VALIDATOR") => {
  const users = await prismaClient.user.findMany({
    where: {
      UserRole: {
        some: {
          Role: {
            name: role,
          },
        },
      },
    },
    select: {
      id: true,
      username: true
    },
  });
  return users;
};

