import { getSession } from 'next-auth/react';
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/Leave';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });

  // Ensure user is authenticated and is an admin/manager
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();
  try {
    const { leaveId, status } = req.body;

    if (!leaveId || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid input data.' });
    }

    // Find the leave application
    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found.' });
    }

    // Security Check: Ensure the manager updating the leave is the one assigned to it
    if (leave.manager.toString() !== session.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to update this leave.' });
    }

    // Update the status and save
    leave.status = status;
    await leave.save();

    res.status(200).json({ message: `Leave status updated to ${status}`, leave });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}