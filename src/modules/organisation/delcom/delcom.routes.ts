import { Router } from "express";

import { serviceType } from "../../../constants/enum";
import { errorHandler } from "../../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../../middlewares/auth";
import { create, get, getById, update , remove, bulkCreate, bulkRemove  } from "./delcom.controller";

const serviceName = serviceType.DELCOM;
const delcomRoutes:Router = Router();

delcomRoutes.post('/', [authMiddleware,authorizeMiddleware(`${serviceName}-CREATE`)] , errorHandler(create));
delcomRoutes.get('/', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] ,errorHandler(get));
delcomRoutes.get('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] , errorHandler(getById));
delcomRoutes.put('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)], errorHandler(update));
delcomRoutes.delete('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)] , errorHandler(remove));

delcomRoutes.post('/bulk',[authMiddleware,authorizeMiddleware(`${serviceName}-BULKCREATE`)] , errorHandler(bulkCreate));
delcomRoutes.delete('/bulk', [authMiddleware,authorizeMiddleware(`${serviceName}-BULKDELETE`)], errorHandler(bulkRemove));

export default delcomRoutes;