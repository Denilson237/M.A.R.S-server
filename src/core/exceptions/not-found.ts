import HttpException from "./http-exception";
import { ErrorCode } from "../enums/error-code.enum";
import { HTTPSTATUS } from "../../config/http.config";


export default class NotFoundException extends HttpException {
    constructor(
        message: any,
        errors?: any,
        errorCode: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
    ) {
        super(message, HTTPSTATUS.NOT_FOUND, errorCode, errors);
    }

}
