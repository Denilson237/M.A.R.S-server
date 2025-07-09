import { Router } from "express";

import { serviceType } from "../../../constants/enum";
import { errorHandler } from "../../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../../middlewares/auth";
import { create, get, getById, update , remove, bulkCreate, bulkRemove  } from "./region.controller";

const serviceName = serviceType.REGION;
const regionRoutes:Router = Router();

regionRoutes.post('/', [authMiddleware,authorizeMiddleware(`${serviceName}-CREATE`)] , errorHandler(create));
regionRoutes.get('/', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] ,errorHandler(get));
regionRoutes.get('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] , errorHandler(getById));
regionRoutes.put('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)], errorHandler(update));
regionRoutes.delete('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)] , errorHandler(remove));

regionRoutes.post('/bulk',[authMiddleware,authorizeMiddleware(`${serviceName}-BULKCREATE`)] , errorHandler(bulkCreate));
regionRoutes.delete('/bulk', [authMiddleware,authorizeMiddleware(`${serviceName}-BULKDELETE`)], errorHandler(bulkRemove));

export default regionRoutes;