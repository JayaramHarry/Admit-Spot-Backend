import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import multer from 'multer';
import { parse } from 'csv-parse';
import xlsx from 'xlsx';
import authMiddleware from '../../../utils/auth';

const upload = multer({ dest: 'uploads/' });

const parseCSV = (filePath: string) =>
  new Promise((resolve, reject) => {
    const contacts = [];
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',' }))
      .on('data', (row) => {
        const [name, email, phone_number, address, timezone] = row;
        contacts.push({ name, email, phone_number, address, timezone });
      })
      .on('end', () => resolve(contacts))
      .on('error', (err) => reject(err));
  });

const parseExcel = (filePath: string) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { header: ['name', 'email', 'phone_number', 'address', 'timezone'] });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  upload.single('file')(req, res, async (err) => {
    authMiddleware(req, res, async (user) => {
      if (err) return res.status(500).json({ error: 'File upload failed' });

      const { path, mimetype } = req.file;
      let contacts = [];

      try {
        if (mimetype === 'text/csv') {
          contacts = await parseCSV(path);
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          contacts = parseExcel(path);
        } else {
          return res.status(400).json({ error: 'Unsupported file format' });
        }

        await db.transaction(async (trx) => {
          for (const contact of contacts) {
            await trx('contacts')
              .insert({ ...contact, user_id: user.id, created_at: new Date().toISOString() })
              .onConflict('email')
              .merge();
          }
        });

        res.status(201).json({ message: 'Contacts imported successfully' });
      } catch (e) {
        res.status(500).json({ message: 'File parsing or database insert failed', error: e.message });
      }
    });
  });
};
