import { Router } from "express";

import { serviceType } from "../../../../constants/enum";
import { errorHandler } from "../../../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../../../middlewares/auth";
import { create, get, getById, update, remove, hardRemove, bulkCreate, bulkRemove } from "./reasons.controller";


const serviceName = serviceType.TICKET_TYPE_REASON;
const reasonsRoutes: Router = Router();

reasonsRoutes.post('/', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-CREATE`)], 
    errorHandler(create));

reasonsRoutes.get('/', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)],
     errorHandler(get));

reasonsRoutes.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], 
    errorHandler(getById));

reasonsRoutes.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-UPDATE`)],
     errorHandler(update));

reasonsRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-DELETE`, `${serviceName}-WRITE`)], 
    errorHandler(hardRemove));

reasonsRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-FULLDELETE`)], 
    errorHandler(remove));

reasonsRoutes.post('/bulk', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-BULKCREATE`)], 
    errorHandler(bulkCreate));

reasonsRoutes.delete('/bulk', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-BULKDELETE`)], 
    errorHandler(bulkRemove));
   

export default reasonsRoutes;