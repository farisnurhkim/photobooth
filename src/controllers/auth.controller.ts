import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/user.model';
import { generateToken, generateActivationCode } from '../services/auth.service';
import { sendActivationEmail, sendResetPasswordEmail } from '../services/email.service';
// Remove unused import: import { Role } from '../interfaces/user.interface';

// Default role 'user' will be set by the DB schema

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nama_lengkap, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'Email already exists' });
      return;
    }

    const activationCode = generateActivationCode();

    const user = await User.create({
      nama_lengkap,
      email,
      password,
      activationCode,
      isActive: false,
    });

    await sendActivationEmail(user.email, activationCode);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for activation code.',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, activationCode } = req.body;

    const user = await User.findOne({ email, activationCode });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid activation code or email' });
      return;
    }

    if (user.isActive) {
      res.status(400).json({ success: false, message: 'User is already active' });
      return;
    }

    user.isActive = true;
    user.activationCode = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Please activate your email first' });
      return;
    }

    const token = generateToken((user._id as any).toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if not found to prevent email enumeration
      res.status(200).json({ success: true, message: 'If email exists, a reset link will be sent.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({ success: true, message: 'Password reset email sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
};
