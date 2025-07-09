import { Router } from "express";

import { serviceType } from "../../../constants/enum";
import { errorHandler } from "../../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../../middlewares/auth";
import { bulkCreate, bulkRemove, create, get, getById, remove, update } from "./permission.controller";

const serviceName = serviceType.PERMISSION;
const permissionRoutes: Router = Router();

permissionRoutes.post('/', [authMiddleware,authorizeMiddleware(`${serviceName}-CREATE`)], errorHandler(create));
permissionRoutes.get('/', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(get));
permissionRoutes.get('/:id', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(getById));
permissionRoutes.put('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)], errorHandler(update));
permissionRoutes.delete('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)], errorHandler(remove));

permissionRoutes.post('/bulk',[authMiddleware,authorizeMiddleware(`${serviceName}-BULKCREATE`)] , errorHandler(bulkCreate));
permissionRoutes.delete('/bulk', [authMiddleware,authorizeMiddleware(`${serviceName}-BULKDELETE`)], errorHandler(bulkRemove));

export default permissionRoutes;