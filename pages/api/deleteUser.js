import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Only DELETE requests allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    await connectDB();

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully.", userId });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user.", error: error.message });
  }
}