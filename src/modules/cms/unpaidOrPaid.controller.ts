import { NextFunction, Request, Response } from "express";

import { sqlQuery } from "../../constants/request";
import { HTTPSTATUS } from "../../config/http.config";
import { ErrorCode } from "../../core/enums/error-code.enum";
import BadRequestException from "../../core/exceptions/bad-requests";
import InternalException from "../../core/exceptions/internal-exception";
import { getConnection, releaseConnection } from "../../core/utils/db.oracle";


//---------------------------------------------------------
//              get all Unpaid Bills Using Query Parameters
//---------------------------------------------------------
export const getBills = async (req: Request, res: Response, next: NextFunction) => {
  // Get Query Parameters
  const { by: searchBy, type } = req.query;
  // check user information
  const authorizeSearchBy: string[] = ["invoice"];
  if (!searchBy) throw new BadRequestException("Invalid parameters", ErrorCode.VALIDATION_INVALID_DATA);

  if (searchBy) {
    if (!authorizeSearchBy.includes(searchBy.toString())) {
      throw new BadRequestException("Invalid parameters", ErrorCode.VALIDATION_INVALID_DATA);
    }
  }

  switch (searchBy) {
    case "invoice":
      getBillsByInvoiceNumber(req, res, next);
      break;
    default:
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        bills: []
      });
      break;
  }
};


//---------------------------------------------------------
//              get all Unpaid Bills By Invoice Number 
//---------------------------------------------------------
export const getBillsByInvoiceNumber =
  async (req: Request, res: Response, next: NextFunction) => {

    let connection;
    try {
      // Get Invoice Number from the query params 
      const { value: invoice_number } = req.query;
      if (!invoice_number) {
        throw new BadRequestException("Invalid parameters", ErrorCode.VALIDATION_INVALID_DATA);
        return res.status(404).json({
          success: false,
          bills: []
        });
      }
      

      // Fetch data from the database
      connection = await getConnection();
      const result = await connection.execute(sqlQuery.bills_by_invoice_number, [invoice_number]);

      // send the response
      res.status(HTTPSTATUS.OK).json({
        success: true,
        bills: result.rows
      });
    } catch (error: any) {
      // Catch the error and return and error respons
      throw new InternalException(error.message, error, ErrorCode.INTERNAL_SERVER_ERROR);
    } finally {
      // close the connection to the database
      if (connection) {
        await releaseConnection(connection);
      }
    }
  };

