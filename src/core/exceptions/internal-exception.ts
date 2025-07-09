import HttpException from "./http-exception";
import { ErrorCode } from "../enums/error-code.enum";
import { HTTPSTATUS } from "../../config/http.config";


export default class InternalException extends HttpException {
    constructor(
        message: any,
        errors?: any,
        errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    ) {
        super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode, errors);
    }

}

