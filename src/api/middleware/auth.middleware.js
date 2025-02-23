import jwt from 'jsonwebtoken';
import { constants } from '../../utils/constant.js';
import { logger } from '../../utils/logger.util.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.signedCookies.accessToken;

    if (!token) {
      logger.warn('Unauthorized access attempt: Token missing', { ip: req.ip, path: req.originalUrl });
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    const decoded = jwt.verify(token, constants.jwt.secret);
    req.user = decoded;

    logger.info('User authenticated successfully', { userId: decoded.userId, ip: req.ip });
    next();
  } catch (error) {
    logger.error('Invalid token', { ip: req.ip, path: req.originalUrl, error: error.message });
    res.status(401).json({ message: 'Invalid token' });
  }
};
