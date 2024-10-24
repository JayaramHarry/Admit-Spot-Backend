import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;
  const validation = loginSchema.validate({ email, password });
  if (validation.error) return res.status(400).json({ error: validation.error.message });

  const user = await db('users').where({ email }).first();
  if (!user || !user.is_verified) return res.status(401).json({ message: 'Unauthorized' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.status(200).json({ token });
};
