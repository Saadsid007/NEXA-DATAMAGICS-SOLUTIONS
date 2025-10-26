import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Leave from '@/models/Leave';
import Resignation from '@/models/Resignation';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'manager'].includes(session.user.role)) {
    return res.status(403).json({ message: "Forbidden: Admins and Managers only" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { role, email } = session.user;
    const counts = {
      users: 0,
      leaves: 0,
      resignations: 0,
    };

    if (role === 'admin') {
      counts.users = await User.countDocuments({ status: 'pending' });
    }

    // Both admin and manager can have leave and resignation requests assigned to them
    counts.leaves = await Leave.countDocuments({
      managerEmail: email,
      status: 'pending'
    });

    counts.resignations = await Resignation.countDocuments({
      managerEmail: email,
      status: 'pending'
    });

    res.status(200).json(counts);

  } catch (error) {
    console.error("Error fetching pending counts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}