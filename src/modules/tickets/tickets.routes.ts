import { Router } from "express";

import { serviceType } from "../../constants/enum";
import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import { rejectTicket, validateTicket } from "./controllers/ticket.workflow.controller";
import { create, get, getById, update, remove, softRemove, bulkCreate, bulkSoftRemove, getMy, getPending } from "./controllers/ticket.controller";
import typeRoutes from "./types/type.routes";


const serviceName = serviceType.TICKET;
const ticketRoutes: Router = Router();

ticketRoutes.post('/', [authMiddleware, authorizeMiddleware(`${serviceName}-CREATE`)], errorHandler(create));
ticketRoutes.get('/', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(get));
ticketRoutes.get('/me', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(getMy));
ticketRoutes.get('/pending', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(getPending));
ticketRoutes.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(getById));

ticketRoutes.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/validate', [authMiddleware], errorHandler(validateTicket));
ticketRoutes.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/reject', [authMiddleware], errorHandler(rejectTicket));

ticketRoutes.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware, authorizeMiddleware(`${serviceName}-UPDATE`)], errorHandler(update));
ticketRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware, authorizeMiddleware(`${serviceName}-DELETE`, `${serviceName}-WRITE`)], errorHandler(softRemove));
ticketRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware, authorizeMiddleware(`${serviceName}-FULLDELETE`)], errorHandler(remove));

ticketRoutes.post('/bulk', [authMiddleware, authorizeMiddleware(`${serviceName}-BULKCREATE`)], errorHandler(bulkCreate));
ticketRoutes.delete('/bulk', [authMiddleware, authorizeMiddleware(`${serviceName}-BULKDELETE`)], errorHandler(bulkSoftRemove));

ticketRoutes.use('/types' , typeRoutes);    


export default ticketRoutes;