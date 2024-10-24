import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';

const deleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  try {
    await db.data.delete({ where: { id: Number(id) } });
    res.status(204).json({});
  } catch (error) {
    console.error(error); // Log the error for server-side debugging
    res.status(500).json({ error: 'Failed to delete data' }); // Optionally, include error.message for more details
  }
};

export default deleteHandler;
