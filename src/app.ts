import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import './config/passport'; // initialize passport strategies
import AppError from './utils/AppError';
import router from './routers';

const app: Application = express();

// Parsers
app.use(express.json());

// CORS — allow all configured origins (comma-separated PUBLIC_URL supports multiple)
const allowedOrigins = (process.env.PUBLIC_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Application routes
app.use('/api/v1', router);

// Root health check
app.get('/', (_req: Request, res: Response) => {
  res.send('Deshio e-commerce Server is running!');
});

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404));
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
