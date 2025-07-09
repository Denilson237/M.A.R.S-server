import { Router } from "express";

import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import { addUserRole, create, disactiveReactive, get, getById, getCommercialUsers, getPublic, getUserNotification, getWithPaginationAndComplexeFilterFeatureOptimizeForPrisma, remove, removeUserRole, softremove, update } from "./user.controller";
import { serviceType } from "../../constants/enum";


const serviceName = serviceType.USER;
const userRoutes:Router = Router();

userRoutes.post('/',[authMiddleware,authorizeMiddleware(`${serviceName}-CREATE`)], errorHandler(create));
userRoutes.get('/commercial', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)],errorHandler(getCommercialUsers));
userRoutes.get('/public', [authMiddleware],errorHandler(getPublic));
userRoutes.get('/', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)],errorHandler(getWithPaginationAndComplexeFilterFeatureOptimizeForPrisma));
userRoutes.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)],errorHandler(getById));
userRoutes.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)],errorHandler(update));
userRoutes.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/disactive-reactive', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)],errorHandler(disactiveReactive));
userRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)],errorHandler(softremove));
userRoutes.delete('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)],errorHandler(remove));
userRoutes.get('/notifications',[authMiddleware,authorizeMiddleware(`${serviceName}-READNOTIFICATION`,`${serviceName}-NOTIFICATION`)], errorHandler(getUserNotification));

userRoutes.post('/role',[authMiddleware,authorizeMiddleware(`${serviceName}-ADDROLE`,`${serviceName}-ROLE`)], errorHandler(addUserRole));
userRoutes.delete('/role',[authMiddleware,authorizeMiddleware(`${serviceName}-REMOVEROLE`,`${serviceName}-ROLE`)], errorHandler(removeUserRole));

export default userRoutes;