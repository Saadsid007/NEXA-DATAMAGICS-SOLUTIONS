import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", ["GET", "HEAD"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectDB();

    // Fetch all users from the database, selecting only necessary fields
    const users = await User.find({}).select("name email employeeCode designation dateOfJoining process shiftTiming workLocation currentCity systemServiceTag holdingAssets managerAssign role employmentType ").lean();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users.", error: error.message });
  }
}