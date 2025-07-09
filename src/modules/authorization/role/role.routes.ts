import { Router } from "express";

import { serviceType } from "../../../constants/enum";
import { errorHandler } from "../../../core/error-handler";
import { assignPermission, bulkCreate, bulkRemove, create, get, getWithPermissionPaginationAndComplexeFilterFeature , getById, getPermissions, remove, update } from "./role.controller";
import authMiddleware, { authorizeMiddleware } from "../../../middlewares/auth";

const serviceName = serviceType.ROLE;
const roleRoutes: Router = Router();

roleRoutes.post('/', [authMiddleware, authorizeMiddleware(`${serviceName}-CREATE`)], errorHandler(create));
roleRoutes.get('/', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(get));
roleRoutes.get('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(getById));
roleRoutes.put('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)], errorHandler(update));
roleRoutes.delete('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)], errorHandler(remove));
roleRoutes.get('/:id/permission',[authMiddleware,authorizeMiddleware(`${serviceName}-PERMISSION-READ`)] , errorHandler(assignPermission));
roleRoutes.post('/:id/permission',[authMiddleware,authorizeMiddleware(`${serviceName}-PERMISSION-WRITE`)] , errorHandler(getPermissions));

roleRoutes.get('/permissions', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(getWithPermissionPaginationAndComplexeFilterFeature));

roleRoutes.post('/bulk',[authMiddleware,authorizeMiddleware(`${serviceName}-BULKCREATE`)] , errorHandler(bulkCreate));
roleRoutes.delete('/bulk', [authMiddleware,authorizeMiddleware(`${serviceName}-BULKDELETE`)], errorHandler(bulkRemove));




export default roleRoutes;