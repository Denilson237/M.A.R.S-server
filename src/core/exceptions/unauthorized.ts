import HttpException from "./http-exception";
import { ErrorCode } from "../enums/error-code.enum";
import { HTTPSTATUS } from "../../config/http.config";


export default class UnauthorizedException extends HttpException {
    constructor(
        message: string,
        errors?: any,
        errorCode: ErrorCode = ErrorCode.ACCESS_UNAUTHORIZED,
    ) {
        super(message, HTTPSTATUS.UNAUTHORIZED, errorCode, errors);
    }

}
