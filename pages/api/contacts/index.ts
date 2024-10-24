import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import authMiddleware from '../../../utils/auth';
import moment from 'moment-timezone';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, async (user) => {
    const { startDate, endDate, timezone } = req.query;

    const contacts = await db('contacts')
      .where('user_id', user.id)
      .modify((queryBuilder) => {
        if (startDate && endDate) {
          queryBuilder.whereBetween('created_at', [new Date(startDate as string), new Date(endDate as string)]);
        }
      });

    const formattedContacts = contacts.map((contact) => ({
      ...contact,
      created_at: moment.utc(contact.created_at).tz(timezone as string).format(),
    }));

    res.status(200).json(formattedContacts);
  });
};
