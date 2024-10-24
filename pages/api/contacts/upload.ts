import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import formidable from 'formidable';
import { authMiddleware } from '../../../utils/auth';
import { parseCSV } from '../../../utils/fileHandler'; // Assuming this is a utility for parsing CSV files

// Extend the NextApiRequest interface to include the `files` property
interface ExtendedNextApiRequest extends NextApiRequest {
  files: {
    file: formidable.File; // Adjust the type based on the expected file structure
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

interface Contact {
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  timezone?: string;
}

const uploadHandler = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  // Use authMiddleware to ensure user is authenticated
  authMiddleware(req, res, async () => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to parse files' });
      }

      const file = files.file; // Adjust if your file input name is different

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        // Parse the uploaded CSV file
        const contacts: Contact[] = await parseCSV(file.path); // Specify the type for contacts
        
        // Filter valid contacts (e.g., those with an email)
        const validContacts = contacts.filter((contact) => contact.email);

        // Insert valid contacts into the database
        await db.transaction(async (trx) => {
          for (const contact of validContacts) {
            await trx('contacts').insert({ ...contact, user_id: req.userId });
          }
        });

        res.status(201).json({ message: 'Contacts uploaded successfully' });
      } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Error uploading contacts' });
      }
    });
  });
};

export default uploadHandler;
