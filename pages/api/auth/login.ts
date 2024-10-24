import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db'; // Assuming you are using Prisma
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const resetPasswordHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, newPassword } = req.body;

  // Check if email is provided
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  // Fetch the user from the database
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Respond with a 200 OK to avoid information leakage
    return res.status(200).json({ message: 'If this email is registered, you will receive a password reset confirmation.' });
  }

  // Check if the new password is the same as the old password
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return res.status(400).json({ message: 'New password must be different from the old password.' });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Set up nodemailer transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Check if environment variables are defined
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials are not defined in environment variables');
    return res.status(500).json({ message: 'Internal server error' });
  }

  try {
    // Send the email confirmation
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      text: 'Your password has been reset successfully.',
    });
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ message: 'Error sending email' });
  }
};

export default resetPasswordHandler;
