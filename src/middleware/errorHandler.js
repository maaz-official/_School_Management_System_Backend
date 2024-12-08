import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error 💥', {
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    logger.error('Error 💥', {
      status: err.status,
      message: err.message
    });

    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};