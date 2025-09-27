import { getSession } from 'next-auth/react';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Leave from '@/models/Leave';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Find the user in the database to get their assigned manager
    const user = await User.findById(session.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.assignedManager) {
      return res.status(400).json({ message: 'No manager assigned. Please contact HR.' });
    }

    // Create a new leave application
    const newLeave = new Leave({
      user: user._id,
      employeeName: user.name,
      employeeCode: user.employeeCode,
      manager: user.assignedManager, // Assign to the user's manager
      leaveType,
      startDate,
      endDate,
      reason,
      // Status will be 'Pending' by default from the model
    });

    await newLeave.save();

    res.status(201).json({ message: 'Leave application submitted successfully!', leave: newLeave });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
