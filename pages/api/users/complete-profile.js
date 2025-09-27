import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import { encode } from "next-auth/jwt";

// Function to generate employee code
async function generateEmployeeCode() {
  // Find the last user with an employee code to determine the next sequential number.
  const lastUser = await User.findOne({ employeeCode: { $exists: true, $ne: null } })
    .sort({ employeeCode: -1 }) // Sorts codes like EMP009, EMP008, etc.
    .lean();

  let nextNumber = 1;
  if (lastUser && lastUser.employeeCode && lastUser.employeeCode.startsWith('EMP')) {
    // Extract the number part from the last employee code (e.g., 'EMP009' -> 9)
    const lastNumber = parseInt(lastUser.employeeCode.substring(3), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Pad the number with leading zeros to a length of 3 (e.g., 1 -> '001', 12 -> '012')
  return `EMP${String(nextNumber).padStart(3, '0')}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await connectDB();
    const { userId } = req.body;

    // **THE MAJOR CHANGE: Manually building the update object**
    // This is a more direct and foolproof way to ensure all data is captured.
    const updateData = {
      designation: req.body.designation,
      process: req.body.process,
      dateOfJoining: req.body.dateOfJoining,
      shiftTiming: req.body.shiftTiming,
      workLocation: req.body.workLocation,
      currentCity: req.body.currentCity,
      systemServiceTag: req.body.systemServiceTag,
      employmentType: req.body.employmentType,
      holdingAssets: req.body.holdingAssets,
      managerAssign: req.body.managerAssign, // Explicitly including the manager
    };

    if (session.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate employee code and update user in MongoDB
    const employeeCode = await generateEmployeeCode();
    const updatedUser = await User.findByIdAndUpdate(userId, 
      { ...updateData, employeeCode, profileComplete: true },
      { new: true }
    ).lean();

    // The client will trigger a session update, so we just need to send a success response.
    res.status(200).json({ message: "Profile completed successfully" });
  } catch (error) {
    console.error("Error completing profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
