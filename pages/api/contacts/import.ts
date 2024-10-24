import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'csv-parse';
import xlsx from 'xlsx';
import authMiddleware from '../../../utils/auth';

// Define a Contact type
interface Contact {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  timezone: string;
}

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to parse CSV files
const parseCSV = (filePath: string): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const contacts: Contact[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',' }))
      .on('data', (row) => {
        const [name, email, phone_number, address, timezone] = row;
        contacts.push({ name, email, phone_number, address, timezone });
      })
      .on('end', () => resolve(contacts))
      .on('error', (err) => reject(err));
  });
};

// Function to parse Excel files
const parseExcel = (filePath: string): Contact[] => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { header: ['name', 'email', 'phone_number', 'address', 'timezone'] });
};

// Import handler function
const importHandler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'File upload failed' });
    }

    // Ensure the user is authenticated
    authMiddleware(req, res, async (user) => {
      const { path, mimetype } = req.file;

      let contacts: Contact[] = []; // Specify the type for contacts

      try {
        // Determine the file type and parse accordingly
        if (mimetype === 'text/csv') {
          contacts = await parseCSV(path);
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          contacts = parseExcel(path);
        } else {
          return res.status(400).json({ error: 'Unsupported file format' });
        }

        // Insert the contacts into the database
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
        console.error(e); // Log the error for debugging
        res.status(500).json({ message: 'File parsing or database insert failed', error: (e as Error).message });
      }
    });
  });
};

export default importHandler;
