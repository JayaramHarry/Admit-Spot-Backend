import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import db from '../../../utils/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET);
    const { email } = decoded;

    await db('users').where({ email }).update({ is_verified: true });

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};
