import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import { formidable } from 'formidable';
import { uploadImage } from "@/lib/cloudinary";
import fs from 'fs/promises';

// Disable Next.js body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse the form
const parseForm = (req) => new Promise((resolve, reject) => formidable().parse(req, (err, fields, files) => err ? reject(err) : resolve([fields, files])));

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
    const [fields, files] = await parseForm(req);

    const getFieldValue = (field) => Array.isArray(field) ? field[0] : field;

    const userId = getFieldValue(fields.userId);

    if (session.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileImageUrl = user.profileImage; // Keep old image if new one isn't provided
    const profileImageFile = getFieldValue(files.profileImage);
    if (profileImageFile) {
      const fileContent = await fs.readFile(profileImageFile.filepath);
      const base64Image = `data:${profileImageFile.mimetype};base64,${fileContent.toString('base64')}`;
      profileImageUrl = await uploadImage(base64Image);
    }

    const updateData = {
      ...Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, getFieldValue(value)])),
      profileImage: profileImageUrl,
    };
    delete updateData.userId; // Don't try to update the userId field

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
