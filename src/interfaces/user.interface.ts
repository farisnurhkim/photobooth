import { Document } from 'mongoose';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

export interface IUser {
  nama_lengkap: string;
  email: string;
  password?: string; // Optional because we might omit it in responses
  role: Role;
  profilePicture?: string;
  isActive: boolean;
  activationCode?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
