import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import {authMiddleware} from '../../../utils/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, async (user) => {
    const { id } = req.body;

    await db('contacts')
      .where({ id, user_id: user.id })
      .update({ deleted_at: new Date().toISOString() });

    res.status(200).json({ message: 'Contact soft-deleted successfully' });
  });
};
