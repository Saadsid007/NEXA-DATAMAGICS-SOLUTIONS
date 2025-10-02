import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  try {
    await connectDB();

    const deletedUser = await User.findByIdAndDelete(session.user.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // You might want to add logic here to clean up related data,
    // like re-assigning users who were managed by this admin.

    res.status(200).json({ message: 'Account deleted successfully!' });

  } catch (error) {
    console.error('Error deleting admin account:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}