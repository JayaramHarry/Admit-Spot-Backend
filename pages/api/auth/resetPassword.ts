import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, newPassword } = req.body;

  const user = await db('users').where({ email }).first();
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db('users').where({ email }).update({ password: hashedPassword });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: 'Password Reset',
    text: 'Your password has been reset successfully.',
  });

  res.status(200).json({ message: 'Password reset successfully' });
};
