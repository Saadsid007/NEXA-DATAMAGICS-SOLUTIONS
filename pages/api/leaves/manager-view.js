import { getSession } from 'next-auth/react';
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/Leave';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });

  // Ensure user is authenticated and is an admin/manager
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  try {
    // Find all leave applications where the manager field matches the logged-in manager's ID
    const leaveApplications = await Leave.find({ manager: session.user.id })
      .sort({ createdAt: -1 }); // Sort by most recent

    res.status(200).json(leaveApplications);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}