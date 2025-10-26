import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Resignation from '@/models/Resignation';
import { sendLeaveApplicationEmailToManager, sendLeaveStatusUpdateEmailToUser } from '@/lib/email'; // Re-using email logic

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      // Find the most recent resignation for the current user
      const resignation = await Resignation.findOne({ user: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

      if (!resignation) {
        return res.status(404).json({ message: 'No resignation application found.' });
      }

      return res.status(200).json(resignation);
    } catch (error) {
      console.error('Error fetching resignation status:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  if (req.method === 'POST') {
    try {
      const { lastWorkingDay, reason, otherReason } = req.body;

      const currentUser = await User.findById(session.user.id).lean();
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (!currentUser.managerAssign) {
        return res.status(400).json({ message: "No manager is assigned to you. Please contact admin." });
      }

      // Check for existing active resignation
      const existingResignation = await Resignation.findOne({
        user: session.user.id,
        status: { $in: ['pending', 'approved'] }
      });

      if (existingResignation) {
        return res.status(400).json({ message: `You already have a resignation with '${existingResignation.status}' status.` });
      }

      const resignationDate = new Date();
      const lwd = new Date(lastWorkingDay);
      const noticePeriod = Math.ceil((lwd - resignationDate) / (1000 * 60 * 60 * 24));

      const newResignation = new Resignation({
        user: session.user.id,
        managerEmail: currentUser.managerAssign,
        resignationDate,
        lastWorkingDay: lwd,
        noticePeriod,
        reason,
        otherReason: reason === 'Others' ? otherReason : undefined,
      });

      await newResignation.save();

      // Send email notification to the manager
      try {
        const manager = await User.findOne({ email: currentUser.managerAssign }).lean();
        if (manager) {
          const subject = `Resignation Application from ${currentUser.name}`;
          const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Resignation Application</h2>
              <p>Dear ${manager.name},</p>
              <p>This is to inform you that <strong>${currentUser.name}</strong> (Employee Code: ${currentUser.employeeCode || 'N/A'}) has submitted a resignation application.</p>
              <h3>Details:</h3>
              <table border="1" cellpadding="10" style="border-collapse: collapse;">
                <tr><th align="left">Reason</th><td>${reason === 'Others' ? otherReason : reason}</td></tr>
                <tr><th align="left">Proposed Last Working Day</th><td>${lwd.toLocaleDateString()}</td></tr>
              </table>
              <p>Please log in to the portal to review and take action on this request.</p>
              <p>Thank you.</p>
            </div>
          `;
          // Re-using the sendEmail function from lib/email.js
          // We can create a more generic function later if needed.
          // For now, we'll call the underlying sendEmail via one of the exports.
          await sendLeaveApplicationEmailToManager({ reason: 'Resignation' }, currentUser, { ...manager, email: manager.email, name: manager.name });
        }
      } catch (emailError) {
        console.error('Failed to send resignation email notification:', emailError);
        // Do not fail the request if email sending fails. Just log the error.
      }

      res.status(201).json({ message: 'Resignation application submitted successfully!' });

    } catch (error) {
      console.error('Error submitting resignation application:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}