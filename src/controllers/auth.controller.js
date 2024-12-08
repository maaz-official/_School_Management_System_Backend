import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_RESET_SECRET,
        { expiresIn: '1h' }
      );

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `Please click on the following link to reset your password: ${resetUrl}`
      });

      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  }
};