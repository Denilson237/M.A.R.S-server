import { DATABASE_EXTERNAL_SERVICE_NAME, DATABASE_EXTERNAL_HOSTNAME, DATABASE_EXTERNAL_PORT, DATABASE_EXTERNAL_USERNAME, DATABASE_EXTERNAL_PASSWORD } from "../secrets";

/*----------------------------------------------------
          External Database configuration
----------------------------------------------------*/
const service: string = DATABASE_EXTERNAL_SERVICE_NAME;
const host: string = DATABASE_EXTERNAL_HOSTNAME;
const port: string = DATABASE_EXTERNAL_PORT;
const user: string = DATABASE_EXTERNAL_USERNAME;
const password: string = DATABASE_EXTERNAL_PASSWORD;

const connectString: string = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${service})))`;

// Connection information for the Oracle database
export const dbConfig = {
    user: user,
    password: password,
    connectString: connectString
};

// Pool Connection information for the Oracle database
export const pooldbConfig = {
    user: user,
    password: password,
    connectString: connectString,
    poolMax: 10, // Maximum number of connections in the pool
    poolMin: 0, // Minimum number of connections in the pool
    poolIncrement: 1, // Number of connections to add when expanding the pool
    poolTimeout: 60 // Number of seconds of inactivity before a connection is closed
};


