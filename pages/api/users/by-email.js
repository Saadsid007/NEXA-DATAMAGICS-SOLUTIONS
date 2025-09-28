import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  // Anyone authenticated can fetch user details by email.
  // This is needed for a user to see their manager's name.
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email query parameter is required." });
  }

  try {
    await connectDB();
    // Fetch all relevant profile fields, excluding sensitive ones like password.
    const user = await User.findOne({ email })
      .select("-password -__v") // Exclude password and version key
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User with that email not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}