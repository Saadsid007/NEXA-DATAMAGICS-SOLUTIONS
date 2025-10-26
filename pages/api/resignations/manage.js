import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Resignation from '@/models/Resignation';
import { sendMail } from '@/lib/nodemailer';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'manager'].includes(session.user.role)) {
    return res.status(403).json({ message: "Forbidden: Admins and Managers only" });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const resignationRequests = await Resignation.find({ managerEmail: session.user.email })
        .populate({
          path: 'user',
          select: 'name employeeCode email'
        })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json(resignationRequests);
    } catch (error) {
      console.error("Error fetching resignation requests:", error);
      return res.status(500).json({ message: "Failed to fetch resignation requests." });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { resignationId, status } = req.body;
      if (!resignationId || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid resignation ID or status.' });
      }

      const updatedResignation = await Resignation.findOneAndUpdate(
        { _id: resignationId, managerEmail: session.user.email },
        { status },
        { new: true }
      ).populate('user');

      if (!updatedResignation) {
        return res.status(404).json({ message: 'Request not found or you are not authorized.' });
      }

      // Send email notification to the user
      try {
        const subject = `Update on your Resignation Application`;
        const html = `
          <p>Dear ${updatedResignation.user.name},</p>
          <p>Your resignation application has been <b>${status}</b>.</p>
          <p>Please log in to the portal for more details.</p>
          <p>Thank you.</p>
        `;
        await sendMail({ to: updatedResignation.user.email, subject, html });
      } catch (emailError) {
        console.error('Failed to send resignation status update email:', emailError);
      }

      return res.status(200).json(updatedResignation);
    } catch (error) {
      console.error("Error updating resignation status:", error);
      return res.status(500).json({ message: "Failed to update resignation status." });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}