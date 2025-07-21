import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import connectDB from './infrastructure/config/db';
import { connectRedis } from './infrastructure/cache/redis';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { container } from './infrastructure/DIContainer/container';
import { TYPES } from './types';
import { Logger } from 'winston';
import { PassportService } from './infrastructure/services/passport';
import { HttpStatus } from './domain/share/enums';
import authRoutes from './presentation/routes/authRoutes';
import advProfileRoutes from './presentation/routes/advocate/profileRoutes';
import adminUserRoutes from './presentation/routes/admin/userRoutes';
import adminAdvocateRoutes from './presentation/routes/admin/advocateRoutes';
import notificationRoutes from './presentation/routes/notificationRoutes';
import userRoutes from './presentation/routes/user/userRoutes';
import userAdvocates from './presentation/routes/user/advocateRoutes';
import bookingRoutes from './presentation/routes/bookingRoutes';
import slotRoutes from './presentation/routes/slotRoutes';
import recurringRuleRoutes from './presentation/routes/recurringRuleRoutes';
import paymentRouter from './presentation/routes/paymentRouter';
import conversationRoutes from './presentation/routes/conversationRoutes';
import reviewRoutes from './presentation/routes/reviewRouter';
import chatFileRoutes from './presentation/routes/chatFileRoutes';
import caseRouter from './presentation/routes/caseRouter';
import subscription from './presentation/routes/subscriptionRoutes';
import adminDashboard from './presentation/routes/adminDashboardRoutes';
import advocateDashboard from './presentation/routes/advocateDashboardRoutes';
import multer from 'multer';
import http from 'http'
import { SocketServer } from './infrastructure/services/socketServer';
import { SocketIOService } from './infrastructure/services/SocketIOService';
import { BookingExpirationJobService } from './infrastructure/services/bookingExpirationJob';
import { ReminderSchedulerService } from './infrastructure/services/reminderScheduler';
dotenv.config();


const app = express();
export const server = http.createServer(app)
// CORS configuration
const corsOptions = {
  origin: process.env.REDIRECT_URL,
  credentials: true,
  exposedHeaders: ['x-access-token'],
};

const logger: Logger = container.get<Logger>(TYPES.Logger);
const socketServer = container.get<SocketServer>(TYPES.SocketIOServer);
socketServer.initialize(server);
const socketIOService = container.get<SocketIOService>(TYPES.SocketIOService);
socketIOService.initialize();
container.get<PassportService>(TYPES.PassportService);
container.get<ReminderSchedulerService>(TYPES.ReminderSchedulerService)
container.get<BookingExpirationJobService>(TYPES.BookingExpirationJob);

app.use('/payment', paymentRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(passport.initialize());
connectRedis()
connectDB();


// Routes
app.use('/api/uploads', express.static(path.join(__dirname, './Uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/advProfile', advProfileRoutes);
app.use('/api/admin/user', adminUserRoutes);
app.use('/api/admin/advocate', adminAdvocateRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/user/advocates', userAdvocates);
app.use('/api/user', userRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/slot', slotRoutes);
app.use('/api/recurring', recurringRuleRoutes);
app.use('/api/payment', paymentRouter);
app.use('/api/conversation', conversationRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/chat', chatFileRoutes);
app.use('/api/case', caseRouter);
app.use('/api/subscribe', subscription);
app.use('/api/advocateDashboard', advocateDashboard);
app.use('/api/adminDashboard', adminDashboard);


app.use((err: unknown, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`Error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`, {
    stack: err instanceof Error ? err.stack : undefined,
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'File too large. Maximum size is 20MB.',
      });
      return;
    }
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: `File upload failed: ${err.message}`,
    });
    return
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode =
    err instanceof Error && (err as any).statusCode
      ? (err as any).statusCode
      : HttpStatus.INTERNAL_SERVER_ERROR;
  const message = isProduction
    ? 'Internal Server Error'
    : err instanceof Error
      ? err.message
      : 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
});




server.listen(process.env.PORT ? parseInt(process.env.PORT) : 8080, () => {
  logger.info(`Server is running on http://localhost:${process.env.PORT || 8080}`);
});



export default app;