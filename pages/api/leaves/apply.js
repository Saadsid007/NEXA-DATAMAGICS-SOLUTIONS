import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Leave from "@/models/Leave";
import { sendLeaveApplicationEmailToManager } from "@/lib/email"; 
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import multer from 'multer';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ storage: multer.memoryStorage() });

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await runMiddleware(req, res, upload.single("attachment"));

    const { leaveType, startDate, endDate, reason } = req.body;
    const attachment = req.file;
    let attachmentUrl = null;

    if (attachment) {
      // Sanitize the filename to handle special characters for the URL
      const sanitizedOriginalName = encodeURIComponent(attachment.originalname.replace(/ /g, '_'));
      const fileName = `${session.user.id}/${Date.now()}-${sanitizedOriginalName}`;
      
      const { data, error } = await supabaseAdmin.storage
        .from('leave-attachments')
        .upload(fileName, attachment.buffer, {
          contentType: attachment.mimetype,
        });

      if (error) {
        console.error('Supabase Upload Error:', error);
        throw new Error('Failed to upload attachment to Supabase.');
      }

      attachmentUrl = supabaseAdmin.storage.from('leave-attachments').getPublicUrl(data.path).data.publicUrl;
    }

    const existingPendingLeave = await Leave.findOne({
      user: session.user.id,
      status: "pending",
    });

    if (existingPendingLeave) {
      return res
        .status(400)
        .json({ message: "You already have a pending leave request." });
    }

    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!currentUser.managerAssign) {
      return res.status(400).json({
        message: "No manager is assigned to you. Please contact admin.",
      });
    }

    const managerUser = await User.findOne({
      email: currentUser.managerAssign,
      role: { $in: ["manager", "admin"] },
    }).lean();

    if (!managerUser) {
      return res.status(400).json({
        message:
          "Your assigned manager's account is not active or does not exist. Please contact admin.",
      });
    }

    const newLeave = new Leave({
      user: session.user.id,
      managerEmail: currentUser.managerAssign,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "pending",
      attachmentUrl,
    });

    await newLeave.save();

    try {
      await sendLeaveApplicationEmailToManager(
        newLeave,
        currentUser,
        managerUser
      );
    } catch (emailError) {
      console.error("Leave application saved, but failed to send email:", emailError);
      // We don't want to fail the whole request if email fails.
      // The leave is already saved in the database.
    }

    res
      .status(201)
      .json({ message: "Leave application submitted successfully!" });
  } catch (error) {
    console.error("Error submitting leave application:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
