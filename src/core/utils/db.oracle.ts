import { dbConfig } from "../../config/db.config";
import { ErrorCode } from "../enums/error-code.enum";
import HttpException from "../exceptions/http-exception";
import { LogLevel, LogType, writeLogEntry } from "./log";

var oracledb = require('oracledb');

// Function to establish a connection to the database
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    writeLogEntry('Database connection error', LogLevel.ERROR, LogType.DATABASE, [err]);
    throw err;
  }
}

// Function to close the database connection
async function releaseConnection(connection: any) {
  try {
    await connection.close();
  } catch (err) {
    writeLogEntry('Closing database connection error:', LogLevel.ERROR, LogType.DATABASE, [err]);
    throw err;
  }
}

// Function to runQuery (execute Query) in the database
const executeQuery = async (query: string, values: any[] = []) => {
    let connection;
    try {
      // Fetch data from the database
      connection = await getConnection();
      const result = await connection.execute(query, values);
      return result;

    } catch (error: any) {
      // Catch the error and return and error response
      writeLogEntry('Internal error:', LogLevel.ERROR, LogType.DATABASE, error);
      return new HttpException(error.message, 500, ErrorCode.INTERNAL_SERVER_ERROR, error);
    } finally {
      // close the connection to the database
      if (connection) {
        await releaseConnection(connection);
      }
    }
}

export { getConnection, releaseConnection , executeQuery };