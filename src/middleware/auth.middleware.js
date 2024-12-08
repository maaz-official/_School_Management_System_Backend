import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized access', 403));
    }
    next();
  };
};