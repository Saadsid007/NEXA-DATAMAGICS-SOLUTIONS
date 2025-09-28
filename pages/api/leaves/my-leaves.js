import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/Leave';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();
    // Find all leave applications for the logged-in user
    const myLeaves = await Leave.find({ user: session.user.id })
      .sort({ createdAt: -1 }) // Sort by most recent
      .lean(); // Use .lean() for better performance

    res.status(200).json(myLeaves);

  } catch (error) {
    console.error('Error fetching user leaves:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
