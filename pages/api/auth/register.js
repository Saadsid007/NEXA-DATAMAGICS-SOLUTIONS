import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { sendNewRegistrationEmailToAdmin } from "@/lib/email";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      phone, // Save phone number
      password: hashedPassword,
      role: "user", // Default role
      status: "pending", // Default status
    });

    // Notify all admins about the new registration
    const admins = await User.find({ role: "admin" }).select("name email").lean();

    for (const admin of admins) {
      try {
        await sendNewRegistrationEmailToAdmin(newUser, admin);
      } catch (emailError) {
        console.error(`Error sending new registration email to admin: ${admin.email}`, emailError);
        // Continue to next admin without failing the whole request
        continue;
      }
    }



    res.status(201).json({ message: "User registered successfully! Your account is pending admin approval.", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
