import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import {authMiddleware} from '../../../utils/auth';
import Joi from 'joi';

const batchSchema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().required(),
    address: Joi.string().required(),
    timezone: Joi.string().required(),
  })
);

const batchContacts = async (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, async (user) => {
    const contacts = req.body;

    const validation = batchSchema.validate(contacts);
    if (validation.error) return res.status(400).json({ error: validation.error.message });

    try {
      await db.transaction(async (trx) => {
        for (const contact of contacts) {
          await trx('contacts')
            .insert({
              ...contact,
              user_id: user.id,
              created_at: new Date().toISOString(),
            })
            .onConflict('email')
            .merge();
        }
      });

      res.status(201).json({ message: 'Contacts batch processed successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Batch processing failed', error: err.message });
    }
  });
};

export default batchContacts;
