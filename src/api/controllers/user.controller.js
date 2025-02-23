import { UserService } from '../../services/UserService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { logger } from '../../utils/logger.util.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  uploadImage = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    logger.info('Uploading image', { userId });

    const imageUrl = await this.userService.uploadImage(userId, req.file);

    logger.info('Image uploaded successfully', { userId, imageUrl });
    res.status(201).json(new ApiResponse(201, { imageUrl }, 'Image uploaded successfully'));
  });

  deleteImage = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const imageName = req.params.imageName;

    logger.info('Deleting image', { userId, imageName });

    await this.userService.deleteImage(userId, imageName);

    logger.info('Image deleted successfully', { userId, imageName });
    res.status(200).json(new ApiResponse(200, {}, 'Image deleted successfully'));
  });

  getUserImages = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    logger.info('Fetching user images', { userId });

    const images = await this.userService.getUserImages(userId);

    logger.info('User images retrieved successfully', { userId, imageCount: images.length });
    res.status(200).json(new ApiResponse(200, { images }, 'User images retrieved successfully'));
  });
}
