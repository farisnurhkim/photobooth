import * as yup from 'yup';

export const registerSchema = yup.object({
  body: yup.object({
    nama_lengkap: yup.string().required('Nama lengkap is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .required('Password is required'),
  }),
});

export const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().required('Password is required'),
  }),
});

export const verifyEmailSchema = yup.object({
  body: yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    activationCode: yup.string().required('Activation code is required'),
  }),
});

export const requestResetPasswordSchema = yup.object({
  body: yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
  }),
});

export const resetPasswordSchema = yup.object({
  body: yup.object({
    token: yup.string().required('Token is required'),
    newPassword: yup
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .required('New Password is required'),
  }),
});
