import { AuthService } from '../../services/AuthService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { constants, isDevelopment } from '../../utils/constant.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

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

    res.status(201).json(new ApiResponse(201, user, 'User register successfully'));
  });

  login = asyncHandler(async (req, res) => {
    const { profiles, user, accessToken, refreshToken } = await this.authService.login(req.body);

    this.setTokenCookie(res, 'accessToken', accessToken, constants.jwt.expiresIn);
    this.setTokenCookie(res, 'refreshToken', refreshToken, constants.jwt.refreshExpiresIn);

    res.status(200).json(new ApiResponse(200, { profiles, user }, 'User logged In'));
  });

  refresh = asyncHandler(async (req, res) => {
    const token = req.signedCookies.refreshToken;
    const { accessToken, refreshToken } = await this.authService.refreshToken(token);

    this.setTokenCookie(res, 'accessToken', accessToken, constants.jwt.expiresIn);
    this.setTokenCookie(res, 'refreshToken', refreshToken, constants.jwt.refreshExpiresIn);
    res.status(200).json(new ApiResponse(200, {}, 'Token Refresh success'));
  });

  logout = asyncHandler(async (req, res) => {
    const id = req.user.userId;
    await this.authService.logout(id);
    res.clearCookie('accessToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });

    res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
  });

  delete = asyncHandler(async (req, res) => {
    const id = req.user.userId;
    await this.authService.delete(id);
    res.clearCookie('accessToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: !isDevelopment, sameSite: 'strict' });

    res.status(200).json(new ApiResponse(200, {}, 'User Deleted'));
  });

  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.userId; // Authenticated user's ID
    await this.authService.changePassword(userId, req.body);

    res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
  });

  updateUser = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const updatedUser = await this.authService.updateUser(userId, req.body);

    res.status(200).json(new ApiResponse(200, updatedUser, 'User updated successfully'));
  });
}
