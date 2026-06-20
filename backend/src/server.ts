import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDatabase, disconnectDatabase } from './config/database';


import logger from './utils/logger';
import corsOptions from './config/cors';
import { initializeSocketHandlers } from './sockets';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';

dotenv.config();

export class DevInsightServer {
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
        origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });
  }

  async initialize(): Promise<void> {
    await this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketHandlers();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDatabase();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', error);
      throw error;
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

    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeRoutes(): void {
    this.app.use('/api', globalLimiter);
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
      logger.info(`Server running on port ${this.port}`);
    });

    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown(): void {
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

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
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

export async function createServer(): Promise<DevInsightServer> {
  const instance = new DevInsightServer();
  await instance.initialize();
  return instance;
}

if (require.main === module) {
  createServer().then((server) => {
    server.listen();
  }).catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}
