import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { UserController } from '../controllers/user.controller.js';
import { upload } from '../../config/multer.config.js';
import { validateImageUpload } from '../middleware/validate.middleware.js';

const router = Router();
const userController = new UserController();

// Upload an image
router.post('/upload-image', authMiddleware, upload.single('image'), validateImageUpload, userController.uploadImage);

// Delete an image
router.delete('/delete-image/:imageName', authMiddleware, userController.deleteImage);

// Get user images
router.get('/images', authMiddleware, userController.getUserImages);

export default router;
