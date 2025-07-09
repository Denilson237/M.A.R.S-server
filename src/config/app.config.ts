import { ACCESS_TOKEN_EXPIRE, ACCESS_TOKEN_SECRET, BASE_PATH, MAIL_NO_REPLY, NODE_ENV, NODE_ORIGIN, NODE_PORT, REFRESH_TOKEN_EXPIRE, REFRESH_TOKEN_SECRET } from "../secrets";

require("dotenv").config();

const appConfig = () => ({
    NODE_ENV: NODE_ENV,
    APP_ORIGIN: NODE_ORIGIN,
    PORT: NODE_PORT,
    BASE_PATH: BASE_PATH,
    //MONGO_URI: getEnv("MONGO_URI"),
    JWT: {
        ACCESS_TOKEN: {
            SECRET: ACCESS_TOKEN_SECRET,
            EXPIRES_IN: ACCESS_TOKEN_EXPIRE,
        },
        REFRESH_TOKEN: {
            SECRET: REFRESH_TOKEN_SECRET,
            EXPIRES_IN: REFRESH_TOKEN_EXPIRE,
        },
       
    },
    MAILER_SENDER: MAIL_NO_REPLY,
});

export const config = appConfig();