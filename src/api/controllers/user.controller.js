import { UserService } from '../../services/UserService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  uploadImage = asyncHandler(async (req, res) => {
    const imageUrl = await this.userService.uploadImage(req.user.userId, req.file);
    res.status(201).json(new ApiResponse(201, { imageUrl }, 'Image uploaded successfully'));
  });

  deleteImage = asyncHandler(async (req, res) => {
    await this.userService.deleteImage(req.user.userId, req.params.imageName);
    res.status(200).json(new ApiResponse(200, {}, 'Image deleted successfully'));
  });

  getUserImages = asyncHandler(async (req, res) => {
    const images = await this.userService.getUserImages(req.user.userId);
    res.status(200).json(new ApiResponse(200, { images }, 'User images retrieved successfully'));
  });
}
