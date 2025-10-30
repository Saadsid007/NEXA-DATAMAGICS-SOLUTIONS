import { connectDB } from '@/lib/mongodb';
import Holiday from '@/models/Holiday';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();
    // Fetch holidays and sort by date
    const holidays = await Holiday.find({}).sort({ date: 1 }).lean();
    res.status(200).json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}