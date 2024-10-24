import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import authMiddleware from '../../../utils/auth';
import Joi from 'joi';

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  address: Joi.string().required(),
  timezone: Joi.string().required(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, async (user) => {
    const { name, email, phone_number, address, timezone } = req.body;
    const validation = contactSchema.validate(req.body);
    if (validation.error) return res.status(400).json({ error: validation.error.message });

    await db('contacts').insert({
      name,
      email,
      phone_number,
      address,
      timezone,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Contact added successfully' });
  });
};