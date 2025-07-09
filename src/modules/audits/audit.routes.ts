import { Router } from "express";

import { serviceType } from "../../constants/enum";
import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import { getById,  getWithPaginationAndComplexeFilterFeatureOptimizeForPrisma  } from "./audit.controller";

const serviceName = serviceType.BANK;
const auditRoutes:Router = Router();

auditRoutes.get('/', [authMiddleware] ,errorHandler(getWithPaginationAndComplexeFilterFeatureOptimizeForPrisma));
auditRoutes.get('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] , errorHandler(getById));

export default auditRoutes;