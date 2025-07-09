import { NextFunction, Request, Response } from "express"
import HttpException  from "./exceptions/http-exception";
import InternalException from "./exceptions/internal-exception";
import { LogLevel, LogType, writeLogEntry } from "./utils/log";
import { ErrorCode } from "./enums/error-code.enum";

export const errorHandler = (method: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next);
        } catch (error: any) {
            writeLogEntry('Something went wrong !',LogLevel.ERROR,LogType.GENERAL,error);
            let exception: HttpException;
            if (error instanceof HttpException) {
                exception = error;
            } else {
                exception = new InternalException('Something went wrong !', error, ErrorCode.INTERNAL_SERVER_ERROR);
            }
            next(exception);
        }
    }
} 