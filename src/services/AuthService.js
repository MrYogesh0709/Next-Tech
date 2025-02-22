import jwt from 'jsonwebtoken';
import { comparePassword, hashPassword } from '../utils/password.util.js';
import { constants } from '../utils/constant.js';
import User from '../models/User.model.js';
import { ApiError } from '../errors/ApiErrors.js';

export class AuthService {
  generateTokens(user) {
    const secret = constants.jwt.secret;

    const payload = { userId: user._id.toString(), email: user.email };
    const refreshTokenPayload = { userId: user._id.toString() };

    const accessTokenOptions = { expiresIn: constants.jwt.expiresIn };
    const refreshTokenOptions = { expiresIn: constants.jwt.refreshExpiresIn };

    const accessToken = jwt.sign(payload, secret, accessTokenOptions);
    const refreshToken = jwt.sign(refreshTokenPayload, secret, refreshTokenOptions);

    return { accessToken, refreshToken };
  }

  async register(data) {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { phone: data.phone }],
    });
    if (existingUser) throw new ApiError(400, 'User with this email or phone already exists');

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

    return {
      accessToken,
      refreshToken,
      user: { id: newUser._id, email: newUser.email },
    };
  }

  async login(data) {
    const user = await User.findOne({ email: data.email });
    if (!user) throw new ApiError(400, 'Invalid credentials');

    const isValidPassword = await comparePassword(data.password, user.password);
    if (!isValidPassword) {
      throw new ApiError(400, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();
    console.log(user);
    return {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, phone: user.phone, images: user.imageUrl },
    };
  }

  async refreshToken(token) {
    const decoded = jwt.verify(token, constants.jwt.secret);
    const user = await User.findOne({ _id: decoded.userId, refreshToken: token });

    if (!user) throw new ApiError('Invalid refresh token');

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  }

  async updateUser(userId, data) {
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) throw new ApiError(404, 'User not found');

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
  }

  async delete(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new ApiError('User not found');
  }
  async changePassword(userId, data) {
    // Validate input
    const { oldPassword, newPassword } = data;

    // Find the user
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    // Compare old password
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) throw new ApiError(400, 'Old password is incorrect');

    // Hash new password
    user.password = await hashPassword(newPassword);
    await user.save();

    return { message: 'Password updated successfully' };
  }
}
