import { Router } from "express";

import { serviceType } from "../../constants/enum";
import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import { create, get, getById, update , remove, bulkCreate, bulkRemove  } from "./bankAgency.controller";

const serviceName = serviceType.BANK_AGENCY;
const bankAgencyRoutes:Router = Router();

bankAgencyRoutes.post('/', [authMiddleware,authorizeMiddleware(`${serviceName}-CREATE`)] , errorHandler(create));
bankAgencyRoutes.get('/', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] ,errorHandler(get));
bankAgencyRoutes.get('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] , errorHandler(getById));
bankAgencyRoutes.put('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)], errorHandler(update));
bankAgencyRoutes.delete('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)] , errorHandler(remove));

bankAgencyRoutes.post('/bulk',[authMiddleware,authorizeMiddleware(`${serviceName}-BULKCREATE`)] , errorHandler(bulkCreate));
bankAgencyRoutes.delete('/bulk', [authMiddleware,authorizeMiddleware(`${serviceName}-BULKDELETE`)], errorHandler(bulkRemove));

export default bankAgencyRoutes;