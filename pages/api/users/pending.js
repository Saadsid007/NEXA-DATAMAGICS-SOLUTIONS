import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    const pendingUsers = await User.find({ status: "pending" }).select("-password");
    res.status(200).json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
