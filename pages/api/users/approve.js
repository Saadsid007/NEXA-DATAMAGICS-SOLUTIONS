import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, action } = req.body; // action can be 'approve' or 'reject'

  if (!userId || !action || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "User ID and a valid action are required." });
  }

  try {
    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (action === "approve") {
      user.status = "approved";
      await user.save();
      res.status(200).json({ message: "User approved." });
    } else { // action === 'reject'
      user.status = "rejected";
      await user.save();
      res.status(200).json({ message: "User rejected." });
    }
  } catch (error) {
    console.error("Error approving/rejecting user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
