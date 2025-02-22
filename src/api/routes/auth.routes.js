import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  UserSchemaLogin,
  UserSchemaRegister,
  UserSchemaUpdate,
  UserSchemaUpdatePassword,
} from '../validator/auth.validate.js';
import { authLimiterMiddleware } from '../middleware/ratelimit.middleware.js';

const router = express.Router();
const authController = new AuthController();

// authlimiter for more control on req
router.route('/register').post(authLimiterMiddleware, validate(UserSchemaRegister), authController.register);
router.route('/login').post(authLimiterMiddleware, validate(UserSchemaLogin), authController.login);
router.route('/refresh').post(authController.refresh);
router.route('/logout').get(authMiddleware, authController.logout);
router.route('/delete').delete(authMiddleware, authController.delete);

router.patch('/update', authMiddleware, validate(UserSchemaUpdate), authController.updateUser);
//change password-only
router.patch(
  '/change-password',
  authLimiterMiddleware,
  authMiddleware,
  validate(UserSchemaUpdatePassword),
  authController.changePassword
);

export default router;
