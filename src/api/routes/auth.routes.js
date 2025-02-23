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

//register user
router.route('/register').post(authLimiterMiddleware, validate(UserSchemaRegister), authController.register);
//login user
router.route('/login').post(authLimiterMiddleware, validate(UserSchemaLogin), authController.login);
//refresh-token if user's accessToken get expire backend will send accessToken by checking old refresh token
router.route('/refresh').post(authController.refresh);

//logout user
router.route('/logout').get(authMiddleware, authController.logout);

//delete user here admin can also delete but since we don't have admin part
router.route('/delete').delete(authMiddleware, authController.delete);

//update user detail but not password
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
