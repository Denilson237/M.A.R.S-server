import HttpException from "./http-exception";
import { ErrorCode } from "../enums/error-code.enum";
import { HTTPSTATUS } from "../../config/http.config";


export default class UnprocessableException extends HttpException {
    constructor(
        message: any,
        errors?: any,
        errorCode: ErrorCode = ErrorCode.RESSOURCE_UNPROCCESSABLE,
    ) {
        super(message, HTTPSTATUS.UNPROCESSABLE_ENTITY, errorCode, errors);
    }

}
