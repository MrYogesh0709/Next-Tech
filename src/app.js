import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import { env } from './utils/env.js';
import { errorHandler } from './errors/ErrorHandler.js';
import { notFound } from './errors/notFound.js';

//middleware
import { generalLimiterMiddleware } from './api/middleware/ratelimit.middleware.js';

//routes
import authRouter from './api/routes/auth.routes.js';
import userRouter from './api/routes/user.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser(env.COOKIE_SECRET));
app.use(generalLimiterMiddleware);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', userRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
