import path from 'path';
import fs from 'fs';
import User from '../models/User.model.js';
import { ApiError } from '../errors/ApiErrors.js';
import { logger } from '../utils/logger.util.js';

export class UserService {
  async uploadImage(userId, file) {
    if (!file) {
      logger.warn(`Upload attempt without file by user: ${userId}`);
      throw new ApiError(400, 'No file uploaded');
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Upload attempt for non-existing user: ${userId}`);
      throw new ApiError(404, 'User not found');
    }

    const imageUrl = `/uploads/${file.filename}`;
    user.imageUrl.push(imageUrl);
    await user.save();

    logger.info(`Image uploaded for user ${userId}: ${imageUrl}`);

    return imageUrl;
  }

  async deleteImage(userId, imageName) {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Image deletion attempt for non-existing user: ${userId}`);
      throw new ApiError(404, 'User not found');
    }

    const imagePath = `/uploads/${imageName}`;
    const imageIndex = user.imageUrl.indexOf(imagePath);

    if (imageIndex === -1) {
      logger.warn(`Image not found in user records for ${userId}: ${imageName}`);
      throw new ApiError(404, 'Image not found');
    }

    // Remove from database
    user.imageUrl.splice(imageIndex, 1);
    await user.save();

    // Delete file from storage
    const filePath = path.join(process.cwd(), 'uploads', imageName);
    const decodedFilePath = decodeURIComponent(filePath);

    try {
      if (fs.existsSync(decodedFilePath)) {
        fs.unlinkSync(decodedFilePath);
        logger.info(`Deleted image file for user ${userId}: ${decodedFilePath}`);
      } else {
        logger.warn(`File not found on disk: ${decodedFilePath}`);
      }
    } catch (error) {
      logger.error(`Error deleting file for user ${userId}: ${error.message}`);
    }
  }

  async getUserImages(userId) {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Image fetch attempt for non-existing user: ${userId}`);
      throw new ApiError(404, 'User not found');
    }

    logger.info(`Fetched images for user ${userId}`);

    return user.imageUrl;
  }
}
