import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  const { userId, role } = req.body;

  if (!userId || !role || !["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid userId or role provided" });
  }

  try {
    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true } // Return the updated document
    ).select("name email role"); // Return only necessary fields

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
}
