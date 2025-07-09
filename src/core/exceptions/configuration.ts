import HttpException from "./http-exception";
import { ErrorCode } from "../enums/error-code.enum";
import { HTTPSTATUS } from "../../config/http.config";


export default class ConfigurationException extends HttpException {
    constructor(
        message: string,
        errors?: any,
        errorCode: ErrorCode = ErrorCode.CONFIGURATION_ERROR,
    ) {
        super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode, errors);
    }

}
