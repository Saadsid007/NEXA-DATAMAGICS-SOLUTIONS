import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email } = req.query;

  if (session.user.email !== email) {
    return res.status(403).json({ message: "Forbidden: You can only fetch your own data." });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email }).select("-password").lean();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}