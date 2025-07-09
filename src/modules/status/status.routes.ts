import { Router } from "express";

import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import {  get, getById, update , getByName  } from "./status.controller";

const statusRoutes:Router = Router();

statusRoutes.get('/', [authMiddleware] ,errorHandler(get));


export default statusRoutes;