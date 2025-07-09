import { NextFunction, Request, Response } from "express";
import HttpException from "../core/exceptions/http-exception";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCode } from "../core/enums/error-code.enum";


export const ErrorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode ?? HTTPSTATUS.INTERNAL_SERVER_ERROR;
    err.message = err.message ?? 'Internal Server Error';

    if (err.name === "CastError") {
        const message = `Ressource not found, Invalid: ${err.path}`
        err = new HttpException(message, HTTPSTATUS.NOT_FOUND , ErrorCode.AUTH_USER_NOT_FOUND , null);
    }

    // Wrong JWT error
    if (err.code === "JsonWebTokenError") {
        const message = `Json Web Token is invalid , Try again`
        err = new HttpException(message, HTTPSTATUS.BAD_REQUEST, ErrorCode.AUTH_INVALID_TOKEN , null);
    }

    // Expire JWT error
    if (err.code === "TokenExpiredError") {
        const message = `Json Web Token is expired , Try again`
        err = new HttpException(message, HTTPSTATUS.BAD_REQUEST, ErrorCode.AUTH_INVALID_TOKEN  , null);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errorCode: err.errorCode,
        errors: err.errors
    })

}