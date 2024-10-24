import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import xlsx from 'xlsx';
import { format } from 'date-fns';
import authMiddleware from '../../../utils/auth';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, async (user) => {
    const contacts = await db('contacts').where({ user_id: user.id });

    const data = contacts.map((contact) => ({
      name: contact.name,
      email: contact.email,
      phone_number: contact.phone_number,
      address: contact.address,
      timezone: contact.timezone,
      created_at: format(new Date(contact.created_at), 'yyyy-MM-dd HH:mm:ss'),
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
};
