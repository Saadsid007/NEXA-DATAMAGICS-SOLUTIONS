import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, status } = req.body;

  if (!userId || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { status });
    res.status(200).json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
