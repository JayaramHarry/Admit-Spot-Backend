import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../utils/auth';
import { parseCSV } from '../../../utils/fileHandler';

import db from '../../../utils/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, async () => {
    const { file } = req;

    try {
      const contacts = await parseCSV(file.path);
      const validContacts = contacts.filter((contact: any) => contact.email);
      
      await db.transaction(async (trx) => {
        for (const contact of validContacts) {
          await trx('contacts').insert({ ...contact, user_id: req.userId });
        }
      });

      res.status(201).json({ message: 'Contacts uploaded successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error uploading contacts' });
    }
  });
};
