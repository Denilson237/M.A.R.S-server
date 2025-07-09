import { Router } from "express";
import { serviceType } from "../../constants/enum";
import authMiddleware from "../../middlewares/auth";
import { errorHandler } from "../../core/error-handler";
import { get } from "./job.controller";


const serviceName = serviceType.JOB;
const jobRouter: Router = Router();

jobRouter.get('/', [authMiddleware], errorHandler(get));

export default jobRouter;