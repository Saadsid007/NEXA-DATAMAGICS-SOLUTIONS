import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

// Disable Next.js body parser for this route to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await connectDB();

    const form = new IncomingForm();

    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = data;
    const { profileImage } = files;
    let newImageUrl = null;

    // 1. Handle Image Upload to Cloudinary if a new image is provided
    if (profileImage && profileImage[0]) {
      const result = await cloudinary.uploader.upload(profileImage[0].filepath, {
        folder: 'user_profiles',
        transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }]
      });
      newImageUrl = result.secure_url;
    }

    // 2. Prepare data for MongoDB update
    const updateData = {};
    const allowedUserFields = ['name', 'phone'];

    for (const key in fields) {
      const value = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
      if (allowedUserFields.includes(key)) {
        updateData[key] = value;
      }
    }

    if (newImageUrl) {
      updateData.profileImage = newImageUrl;
    }

    // 3. Update the user in the database
    await User.findByIdAndUpdate(session.user.id, { $set: updateData });

    res.status(200).json({
      message: "Profile updated successfully",
      newImageUrl: newImageUrl || session.user.profileImage, // Return new or existing image URL
      newName: updateData.name || session.user.name,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error updating profile", error: error.message });
  }
}