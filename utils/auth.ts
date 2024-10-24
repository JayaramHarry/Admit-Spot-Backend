import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

export const generateToken = (userId: number) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const authMiddleware = (req: NextApiRequest, res: NextApiResponse, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.userId = decoded.id;
    next();
  });
};
