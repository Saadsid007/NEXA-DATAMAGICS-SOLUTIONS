import { connectDB } from '@/lib/mongodb';
import Announcement from '@/models/Announcement';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}