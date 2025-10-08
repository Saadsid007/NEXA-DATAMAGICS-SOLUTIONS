import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Leave from '@/models/Leave';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();
    const { leaveType, startDate, endDate, reason } = req.body;

    // 1. Find the current user in the database to get their assigned manager
    const currentUser = await User.findById(session.user.id).lean();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!currentUser.managerAssign) {
      return res.status(400).json({ message: "No manager is assigned to you. Please contact admin." });
    }

    // 2. Validate that the assigned person exists and has the 'manager' or 'admin' role
    const managerUser = await User.findOne({ email: currentUser.managerAssign, role: { $in: ['manager', 'admin'] } }).lean();
    if (!managerUser) {
      return res.status(400).json({ 
        message: "Your assigned manager's account is not active or does not exist. Please contact admin." 
      });
    }

    // 3. Create a new leave document with the correct schema
    const newLeave = new Leave({
      user: session.user.id,
      managerEmail: currentUser.managerAssign,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending', // Default status
    });

    // 4. Save the leave application
    await newLeave.save();

    // TODO: Implement email notification to the manager (currentUser.managerAssign) here.

    res.status(201).json({ message: 'Leave application submitted successfully!' });

  } catch (error) {
    console.error('Error submitting leave application:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
