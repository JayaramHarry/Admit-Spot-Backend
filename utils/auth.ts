import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import bcrypt from 'bcrypt'; // Ensure you have the correct bcrypt import
import jwt from 'jsonwebtoken';

// Extend NextApiRequest to include userId
interface ExtendedNextApiRequest extends NextApiRequest {
  userId?: string; // or number, depending on your user ID type
}

const authHandler = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  // Check for the correct HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.user.findUnique({ where: { email } });

    // Check if the user exists and validate the password
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ error: 'Internal Server Error: Missing JWT_SECRET' });
    }

    const token = jwt.sign({ email: user.email }, secret, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    // Log the error for debugging
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};

export default authHandler;
