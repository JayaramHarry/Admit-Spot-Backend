import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db'; // Ensure this uses the PrismaClient
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../../utils/mailer';
import Joi from 'joi';

// Define the registration schema with Joi
const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
});

const registerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract data from the request body
  const { email, password, name } = req.body;

  // Validate the request body
  const validation = registrationSchema.validate({ email, password, name });
  if (validation.error) {
    return res.status(400).json({ error: validation.error.message });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if the user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Create a new user and ignore the return value
  await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  // Get JWT secret and create a verification token
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  const token = jwt.sign({ email }, secret, { expiresIn: '1h' });

  // Send a verification email
  sendVerificationEmail(email, token);

  // Respond with a success message
  res.status(201).json({ message: 'User registered. Check your email for verification.' });
};

export default registerHandler;
