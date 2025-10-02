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

    const formData = req.body;
    
    // Separate predefined fields from custom fields
    const updateData = {};
    const customFields = new Map();
    const predefinedKeys = Object.keys(User.schema.paths);

    for (const key in formData) {
      if (predefinedKeys.includes(key)) {
        // Only allow updating specific, safe, predefined fields
        if (['name', 'phone', 'currentCity', 'process', 'workLocation'].includes(key)) {
          updateData[key] = formData[key];
        }
      } else {
        // Everything else is a custom field
        customFields.set(key, formData[key]);
      }
    }

    updateData.customFields = customFields;

    if (Object.keys(updateData).length === 1 && updateData.customFields.size === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });

  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}