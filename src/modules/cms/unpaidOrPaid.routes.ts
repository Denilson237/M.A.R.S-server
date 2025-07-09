import { Router } from "express";

import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import { serviceType } from "../../constants/enum";
import { getBills } from "./unpaidOrPaid.controller";

const serviceName = serviceType.CMS_UNPAID;
const unpaidOrPaidRoutes:Router = Router();

unpaidOrPaidRoutes.get('/', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)] , errorHandler(getBills));

export default unpaidOrPaidRoutes;