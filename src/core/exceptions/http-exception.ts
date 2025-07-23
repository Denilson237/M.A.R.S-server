import { ErrorCode } from "../enums/error-code.enum";
import { HttpStatusCode } from "../../config/http.config";
export { ErrorCode }; // modification

class HttpException extends Error {
    message: string;
    statusCode: HttpStatusCode;
    errorCode: ErrorCode;
    errors?: any;

    constructor(
        message:any,
        statusCode:HttpStatusCode,
        errorCode:ErrorCode,
        errors?:any,
    ){
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.errors = errors;
        
        Error.captureStackTrace(this,this.constructor)
    }

}

export default HttpException;
