import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db'; // Ensure this uses the PrismaClient
import jwt from 'jsonwebtoken';

const verifyEmailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token as string, secret) as { email: string };
    await db.user.update({
      where: { email: decoded.email },
      data: { emailVerified: true },
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    // Use the error in the response for better debugging
    console.error(error); // Log the error for server-side debugging
    res.status(400).json({ error: 'Invalid token' }); // Optionally, include error.message for more details
  }
};

export default verifyEmailHandler;
