import { AuthService } from '../../services/AuthService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { constants, isDevelopment } from '../../utils/constant.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { logger } from '../../utils/logger.util.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  setTokenCookie(res, tokenName, tokenValue, expiresIn) {
    res.cookie(tokenName, tokenValue, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'strict',
      signed: true,
      maxAge: expiresIn * 1000,
      expires: new Date(Date.now() + expiresIn * 1000),
    });
  }

  register = asyncHandler(async (req, res) => {
    const data = req.body;
    const { user, refreshToken, accessToken } = await this.authService.register(data);

    this.setTokenCookie(res, 'accessToken', accessToken, constants.jwt.expiresIn);
    this.setTokenCookie(res, 'refreshToken', refreshToken, constants.jwt.refreshExpiresIn);

    logger.info('User registered successfully', { userId: user.id });

    res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
  });

  login = asyncHandler(async (req, res) => {
    const { profiles, user, accessToken, refreshToken } = await this.authService.login(req.body);

    this.setTokenCookie(res, 'accessToken', accessToken, constants.jwt.expiresIn);
    this.setTokenCookie(res, 'refreshToken', refreshToken, constants.jwt.refreshExpiresIn);

    logger.info('User logged in', { userId: user.id });

    res.status(200).json(new ApiResponse(200, { profiles, user }, 'User logged in'));
  });

  refresh = asyncHandler(async (req, res) => {
    const token = req.signedCookies.refreshToken;
    const { accessToken, refreshToken } = await this.authService.refreshToken(token);

    this.setTokenCookie(res, 'accessToken', accessToken, constants.jwt.expiresIn);
    this.setTokenCookie(res, 'refreshToken', refreshToken, constants.jwt.refreshExpiresIn);

    logger.info('Token refreshed');

    res.status(200).json(new ApiResponse(200, {}, 'Token refresh success'));
  });

  logout = asyncHandler(async (req, res) => {
    const id = req.user.userId;
    await this.authService.logout(id);
    res.clearCookie('accessToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });

    logger.info('User logged out', { userId: id });

    res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
  });

  delete = asyncHandler(async (req, res) => {
    const id = req.user.userId;
    await this.authService.delete(id);
    res.clearCookie('accessToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });

    logger.info('User deleted', { userId: id });

    res.status(200).json(new ApiResponse(200, {}, 'User deleted'));
  });

  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    await this.authService.changePassword(userId, req.body);

    logger.info('Password changed', { userId });

    res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
  });

  updateUser = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const updatedUser = await this.authService.updateUser(userId, req.body);

    logger.info('User updated', { userId });

    res.status(200).json(new ApiResponse(200, updatedUser, 'User updated successfully'));
  });
}
