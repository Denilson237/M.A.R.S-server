import { Router } from "express";

import { serviceType } from "../../../constants/enum";
import { errorHandler } from "../../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../../middlewares/auth";
import { create, get, getById, update, remove, hardRemove, bulkCreate, bulkRemove } from "./type.controller";
import { create as createWithReasons , get as getWithReasons, getById as getByIdWithReasons , bulkCreate as bulkCreateeWithReasons} from "./type-reason.controller";
import reasonsRoutes from "./reasons/reasons.routes";


const serviceName = serviceType.TICKET_TYPE;
const typeRoutes: Router = Router();

typeRoutes.post('/', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-CREATE`)], 
    errorHandler(create));

typeRoutes.get('/', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)],
     errorHandler(get));

typeRoutes.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], 
    errorHandler(getById));

typeRoutes.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-UPDATE`)],
     errorHandler(update));

typeRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-DELETE`, `${serviceName}-WRITE`)], 
    errorHandler(hardRemove));

typeRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-FULLDELETE`)], 
    errorHandler(remove));

typeRoutes.post('/bulk', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-BULKCREATE`)], 
    errorHandler(bulkCreate));

typeRoutes.delete('/bulk', 
    [authMiddleware, authorizeMiddleware(`${serviceName}-BULKDELETE`)], 
    errorHandler(bulkRemove));

typeRoutes.use('/reasons' , reasonsRoutes);    

export default typeRoutes;