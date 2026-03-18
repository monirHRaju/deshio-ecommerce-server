import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import './config/passport'; // initialize passport strategies
import AppError from './utils/AppError';
import router from './routers';

const app: Application = express();

// Parsers
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.PUBLIC_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

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
