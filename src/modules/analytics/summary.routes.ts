import { Router } from "express";

import { serviceType } from "../../constants/enum";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import { summary } from "./summary.controller";

const serviceName = serviceType.SUMMARY;
const summaryRoutes:Router = Router();

summaryRoutes.get('/', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`,`${serviceName}-README`)] , summary);

export default summaryRoutes;