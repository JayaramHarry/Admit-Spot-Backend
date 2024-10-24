import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';

const exportHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await db.data.findMany();
    // Implement export logic (e.g., CSV, JSON, etc.)
    res.status(200).json(data);
  } catch (error) {
    console.error(error); // Log the error for server-side debugging
    res.status(500).json({ error: 'Failed to export data' }); // Optionally include error.message for more details
  }
};

export default exportHandler;
