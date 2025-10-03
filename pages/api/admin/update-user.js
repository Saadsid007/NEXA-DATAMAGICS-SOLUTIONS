import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  try {
    await connectDB();

    const { userId, ...formData } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const updateData = {};
    const customFields = new Map();
    const predefinedKeys = Object.keys(User.schema.paths);

    for (const key in formData) {
      if (predefinedKeys.includes(key)) {
        if (['name', 'phone', 'currentCity', 'process', 'workLocation', 'designation', 'dateOfJoining', 'shiftTiming', 'systemServiceTag', 'employmentType', 'holdingAssets', 'managerAssign'].includes(key)) {
          updateData[key] = formData[key];
        }
      } else {
        customFields.set(key, formData[key]);
      }
    }

    updateData.customFields = customFields;

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
