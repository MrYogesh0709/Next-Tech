import jwt from 'jsonwebtoken';
import { constants } from '../../utils/constant.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.signedCookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    const decoded = jwt.verify(token, constants.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
