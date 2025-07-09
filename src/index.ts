import express, { Express, NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { NODE_ORIGIN, NODE_PORT } from "./secrets";
import rootRouter from "./modules";
import { ErrorMiddleware } from "./middlewares/error";
import { initSocketServer } from "./core/utils/socketServer";

const app: Express = express();

// Configure express behind a reverse proxy Express will trust the X-Forwarded-For and X-Forwarded-Proto headers
app.set('trust proxy', true);

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// array of allow domain declare in .env
const origin = NODE_ORIGIN.split(";");

// cors => cross origin resource sharing
app.use(
  cors({
    origin: origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true,
  })
);

app.use('/api/v1', rootRouter);

// unknow route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

// Capture Error
app.use(ErrorMiddleware);

// Create server
const server = http.createServer(app);

// initSocketServer
initSocketServer(server);

server.listen(NODE_PORT, () => {
    console.log(`Server is connected with port ${NODE_PORT}`);
})

import "./crontab";