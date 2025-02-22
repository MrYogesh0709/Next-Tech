import path from 'path';
import fs from 'fs';
import User from '../models/User.model.js';
import { ApiError } from '../errors/ApiErrors.js';

export class UserService {
  async uploadImage(userId, file) {
    if (!file) throw new ApiError(400, 'No file uploaded');

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const imageUrl = `/uploads/${file.filename}`;
    user.imageUrl.push(imageUrl);
    await user.save();

    return imageUrl;
  }

  async deleteImage(userId, imageName) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const imagePath = `/uploads/${imageName}`;
    const imageIndex = user.imageUrl.indexOf(imagePath);

    if (imageIndex === -1) throw new ApiError(404, 'Image not found');

    // Remove from database
    user.imageUrl.splice(imageIndex, 1);
    await user.save();

    // Delete file from storage
    const filePath = path.join(process.cwd(), 'uploads', imageName);
    const decodedFilePath = decodeURIComponent(filePath);
    try {
      if (fs.existsSync(decodedFilePath)) {
        fs.unlinkSync(decodedFilePath);
      } else {
        console.warn('File not found:', decodedFilePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error.message);
    }
  }

  async getUserImages(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    return user.imageUrl;
  }
}
