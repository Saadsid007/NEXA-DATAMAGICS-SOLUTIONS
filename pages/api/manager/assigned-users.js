import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "manager") {
    return res.status(403).json({ message: "Forbidden: Managers only" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    // Find users who are assigned to the current manager
    const assignedUsers = await User.find({ managerAssign: session.user.email })
      .select("name email phone employeeCode designation process dateOfJoining shiftTiming workLocation currentCity systemServiceTag employmentType holdingAssets customFields")
      .lean();

    res.status(200).json(assignedUsers);
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    res.status(500).json({ message: "Failed to fetch assigned users.", error: error.message });
  }
}
