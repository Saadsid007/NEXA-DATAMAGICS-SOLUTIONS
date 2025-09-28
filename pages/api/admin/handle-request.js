import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ message: "User ID and action are required." });
  }

  let update;
  switch (action) {
    case "approveAsUser":
      update = { status: "approved", role: "user" };
      break;
    case "approveAsManager":
      update = { status: "approved", role: "manager" };
      break;
    case "reject":
      update = { status: "rejected" };
      break;
    default:
      return res.status(400).json({ message: "Invalid action." });
  }

  try {
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: `User ${action} successfully.`, user: updatedUser });
  } catch (error) {
    console.error("Error handling user request:", error);
    res.status(500).json({ message: "Failed to handle user request.", error: error.message });
  }
}
