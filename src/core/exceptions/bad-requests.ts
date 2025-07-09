import HttpException from "./http-exception";
import { ErrorCode } from "../enums/error-code.enum";
import { HTTPSTATUS } from "../../config/http.config";


export default class BadRequestException extends HttpException {
    constructor(
        message: any,
        errors?: any,
        errorCode: ErrorCode = ErrorCode.VALIDATION_INVALID_DATA
    ) {
        super(message, HTTPSTATUS.BAD_REQUEST, errorCode, errors);
    }

}
