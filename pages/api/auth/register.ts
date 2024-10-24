import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../../utils/mailer';
import Joi from 'joi';

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password, name } = req.body;

  const validation = registrationSchema.validate({ email, password, name });
  if (validation.error) return res.status(400).json({ error: validation.error.message });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db('users').insert({ email, password: hashedPassword, name }).returning('*');
  
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  sendVerificationEmail(email, token); // sends verification email

  res.status(201).json({ message: 'User registered. Check your email for verification.' });
};
