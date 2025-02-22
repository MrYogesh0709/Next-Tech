import mongoose from 'mongoose';
import { env } from '../utils/env.js';

export default async function connectToMongoDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('An unknown error occurred:', error);
    process.exit(1);
  }
}
