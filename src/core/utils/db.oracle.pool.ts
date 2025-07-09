import { dbConfig } from "../../config/db.config";
import { LogLevel, LogType, writeLogEntry } from "./log";


var oracledb = require('oracledb');

async function getConnection() {
  try {
    await oracledb.createPool(dbConfig, (err: any) => {
      if (err) {
        writeLogEntry(`Oracle connection pool creation error`, LogLevel.ERROR, LogType.DATABASE, [ "error", err]);
        return;
      }
      writeLogEntry(`Oracle connection pool successfully created.`, LogLevel.INFO, LogType.DATABASE, [ "error", err]);
    });
    return await oracledb.getConnection();
  } catch (err) {
    writeLogEntry(`Error obtaining an Oracle connection`, LogLevel.ERROR, LogType.DATABASE, [ "error", err]);
    throw err;
  }
}


async function executeQuery(connection: any, query: string, values: any[]) {
  try {
    await connection.execute(query);
  } catch (err) {
    writeLogEntry(`Error during query execution`, LogLevel.ERROR, LogType.DATABASE, ["query", query, "error", err]);
    throw err;
  } finally {
    try {
      await connection.close();
    } catch (error) {
    writeLogEntry(`Database closing connection error`, LogLevel.ERROR, LogType.DATABASE, ["query", query, "error", error]);
    }
  }
}

// Function to close database pool 
async function releaseConnection() {
  try {
    await oracledb.getPool().close(0);
  } catch (err) {
    writeLogEntry(`Error closing connection pool`, LogLevel.ERROR, LogType.DATABASE, ["error", err]);
    throw err;
  }
}

async function run(query: string, values: any[]) {
  let connection
  try {
    const connection = await getConnection();
    let query = ''
    let values: any[] = [];
    await executeQuery(connection, query, values);
  } catch (err) {
    writeLogEntry(`Error in run function :`, LogLevel.ERROR, LogType.DATABASE, ["error", err,"query",query,"values",values]);
  } finally {
    if (connection) {
      await releaseConnection();
    }
  }
}