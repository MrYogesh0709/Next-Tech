import mongoose from 'mongoose';
import { env } from '../utils/env.js';
import { logger } from '../utils/logger.util.js';

export default async function connectToMongoDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB successfully!');
  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}
