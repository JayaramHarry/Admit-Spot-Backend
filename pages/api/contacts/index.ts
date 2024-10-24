import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';
import {authMiddleware} from '../../../utils/auth';
import moment from 'moment-timezone';
import { Knex } from 'knex'; // Import Knex types

// Define a type for the user
interface User {
  id: number;
  // Add other user properties as needed
}

// Define a type for the query parameters
interface QueryParams {
  startDate?: string;
  endDate?: string;
  timezone?: string;
}

// Define a type for the contact
interface Contact {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  timezone: string;
  created_at: string; // Adjust type as needed
}

const indexHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, async (user: User) => {
    // Type assertion for req.query
    const { startDate, endDate, timezone } = req.query as QueryParams;

    try {
      // Fetch contacts based on user ID
      const contacts: Contact[] = await db('contacts')
        .where('user_id', user.id)
        .modify((queryBuilder: Knex.QueryBuilder) => { // Specify the type for queryBuilder
          if (startDate && endDate) {
            queryBuilder.whereBetween('created_at', [
              new Date(startDate),
              new Date(endDate),
            ]);
          }
        });

      // Format the contacts with the user's timezone
      const formattedContacts = contacts.map((contact: Contact) => ({
        ...contact,
        created_at: moment.utc(contact.created_at).tz(timezone || 'UTC').format(), // Default to UTC if timezone is not provided
      }));

      // Send the formatted contacts as response
      res.status(200).json(formattedContacts);
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  });
};

export default indexHandler;
