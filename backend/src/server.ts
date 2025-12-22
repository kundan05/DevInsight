import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { connectDatabase, disconnectDatabase } from './config/database';
import redis from './config/redis';
import logger from './utils/logger';
import corsOptions from './config/cors';
import { initializeSocketHandlers } from './sockets';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

class DevInsightServer {
    public app: Application;
    public server: http.Server;
    public io: Server;
    public port: number;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = parseInt(process.env.BACKEND_PORT || '5000', 10);
        this.io = new Server(this.server, {
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
        });

        this.initializeDatabase();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeSocketHandlers();
        this.initializeErrorHandling();
    }

    private async initializeDatabase(): Promise<void> {
        try {
            await connectDatabase();
        } catch (error) {
            logger.error('Failed to connect to database', error);
            process.exit(1);
        }
    }

    private initializeMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors(corsOptions));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(compression());

        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined', {
                stream: {
                    write: (message) => logger.http(message.trim()),
                },
            }));
        }

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        });
        this.app.use('/api', limiter);
    }

    private initializeRoutes(): void {
        this.app.get('/api/health', (req: Request, res: Response) => {
            res.status(200).json({ status: 'ok', uptime: process.uptime() });
        });

        this.app.use('/api', routes);
    }

    private initializeSocketHandlers(): void {
        initializeSocketHandlers(this.io);
    }

    private initializeErrorHandling(): void {
        this.app.use(notFoundHandler);
        this.app.use(errorHandler);
    }

    public listen(): void {
        this.server.listen(this.port, () => {
            logger.info(`Server is running on port ${this.port}`);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down gracefully...`);

            this.io.close(() => {
                logger.info('Socket.io server closed');
            });

            this.server.close(async () => {
                logger.info('HTTP server closed');
                await disconnectDatabase();
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason) => {
            logger.error('Unhandled Rejection:', reason);
            gracefulShutdown('unhandledRejection');
        });
    }
}

const app = new DevInsightServer();
app.listen();
