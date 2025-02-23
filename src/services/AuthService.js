import jwt from 'jsonwebtoken';
import { comparePassword, hashPassword } from '../utils/password.util.js';
import { constants } from '../utils/constant.js';
import User from '../models/User.model.js';
import { ApiError } from '../errors/ApiErrors.js';
import { logger } from '../utils/logger.util.js';

export class AuthService {
  generateTokens(user) {
    const secret = constants.jwt.secret;
    const payload = { userId: user._id.toString(), email: user.email };
    const refreshTokenPayload = { userId: user._id.toString() };

    const accessTokenOptions = { expiresIn: constants.jwt.expiresIn };
    const refreshTokenOptions = { expiresIn: constants.jwt.refreshExpiresIn };

    const accessToken = jwt.sign(payload, secret, accessTokenOptions);
    const refreshToken = jwt.sign(refreshTokenPayload, secret, refreshTokenOptions);

    logger.info(`Generated tokens for user ${user.email}`);

    return { accessToken, refreshToken };
  }

  async register(data) {
    const existingUser = await User.findOne({ $or: [{ email: data.email }, { phone: data.phone }] });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email or phone: ${data.email} / ${data.phone}`);
      throw new ApiError(400, 'User with this email or phone already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const newUser = await User.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
    });

    const { accessToken, refreshToken } = this.generateTokens(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    logger.info(`User registered: ${newUser.email}`);

    return { accessToken, refreshToken, user: { id: newUser._id, email: newUser.email } };
  }

  async login(data) {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      logger.warn(`Failed login attempt for email: ${data.email}`);
      throw new ApiError(400, 'Invalid credentials');
    }

    const isValidPassword = await comparePassword(data.password, user.password);
    if (!isValidPassword) {
      logger.warn(`Failed login attempt due to incorrect password for email: ${data.email}`);
      throw new ApiError(400, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, images: user.imageUrl, phone: user.phone },
    };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, constants.jwt.secret);
      const user = await User.findOne({ _id: decoded.userId, refreshToken: token });

      if (!user) {
        logger.warn(`Invalid refresh token attempt for user ID: ${decoded.userId}`);
        throw new ApiError(401, 'Invalid refresh token');
      }

      const { accessToken, refreshToken } = this.generateTokens(user);
      user.refreshToken = refreshToken;
      await user.save();

      logger.info(`User refreshed token: ${user.email}`);

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error(`Error refreshing token: ${error.message}`);
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  async updateUser(userId, data) {
    const { email, phone } = data;
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Update attempt for non-existing user: ${userId}`);
      throw new ApiError(404, 'User not found');
    }
    if ((email && email !== user.email) || (phone && phone !== user.phone)) {
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
        _id: { $ne: userId }, // Exclude the current user from the check
      });

      if (existingUser) {
        logger.warn(`Update failed: Email or phone already in use by another user`);
        throw new ApiError(400, 'Email or phone already in use');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      logger.warn(`Update attempt for non-existing user: ${userId}`);
      throw new ApiError(404, 'User not found');
    }

    logger.info(`User updated: ${updatedUser.email}`);

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      username: updatedUser.username,
      imageUrl: updatedUser.imageUrl,
    };
  }

  async logout(userId) {
    await User.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
    logger.info(`User logged out: ${userId}`);
  }

  async delete(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      logger.warn(`Deletion attempt for non-existing user: ${userId}`);
      throw new ApiError(404, 'User not found');
    }

    logger.info(`User deleted: ${user.email}`);
  }

  async changePassword(userId, data) {
    const { oldPassword, newPassword } = data;

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Password change attempt for non-existing user: ${userId}`);
      throw new ApiError(404, 'User not found');
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      logger.warn(`Failed password change due to incorrect old password for user: ${user.email}`);
      throw new ApiError(400, 'Old password is incorrect');
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password updated successfully' };
  }
}
