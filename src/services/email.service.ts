import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

export const sendActivationEmail = async (to: string, code: string): Promise<void> => {
  const mailOptions = {
    from: process.env.ZOHO_EMAIL,
    to,
    subject: 'Web Booking Photobooth - Account Activation',
    html: `
      <h2>Welcome to Web Booking Photobooth!</h2>
      <p>Thank you for registering. Please activate your account using the code below:</p>
      <h3 style="background: #f4f4f4; padding: 10px; display: inline-block;">${code}</h3>
      <p>This code will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (to: string, token: string): Promise<void> => {
  // Replace with the actual frontend URL domain later (from env)
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.ZOHO_EMAIL,
    to,
    subject: 'Web Booking Photobooth - Reset Password',
    html: `
      <h2>Reset Password Request</h2>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; display: inline-block;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
