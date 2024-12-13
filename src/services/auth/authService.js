import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../models/user.model.js';
import { AppError } from '../../utils/appError.js';
import { sendEmail } from '../../utils/email.js';
import { generateTOTP, verifyTOTP } from './totpService.js';

export class AuthService {
  static async login(email, password, options = {}) {
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      const tempToken = this.generateTempToken(user);
      return {
        requiresTwoFactor: true,
        tempToken
      };
    }

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      token,
      refreshToken,
      user: this.sanitizeUser(user)
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return {
        token: this.generateToken(user),
        user: this.sanitizeUser(user)
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  static async setupTwoFactor(userId) {
    const user = await User.findById(userId);
    const secret = await generateTOTP();
    
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save();

    return {
      secret: secret.base32,
      qrCode: secret.qrCode
    };
  }

  static async verifyTwoFactor(userId, token) {
    const user = await User.findById(userId).select('+twoFactorSecret');
    const isValid = await verifyTOTP(user.twoFactorSecret, token);

    if (!isValid) {
      throw new AppError('Invalid 2FA token', 401);
    }

    user.twoFactorEnabled = true;
    await user.save();

    return this.generateToken(user);
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  }

  static sanitizeUser(user) {
    const sanitized = user.toObject();
    delete sanitized.password;
    delete sanitized.twoFactorSecret;
    return sanitized;
  }
}