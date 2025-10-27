import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import Leave from "@/models/Leave";
import User from "@/models/User"; // To populate user details
import { sendLeaveStatusUpdateEmailToUser } from "@/lib/email";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "manager") {
    return res.status(403).json({ message: "Forbidden: Managers only" });
  }

  if (req.method === "GET") {
    try {
      await connectDB();
      // Find leave requests where the managerEmail matches the current manager's email
      const leaveRequests = await Leave.find({ managerEmail: session.user.email })
        .populate({
          path: "user",
          select: "name employeeCode email", // Select which user fields to return
        })
        .sort({ createdAt: -1 }) // Show newest first
        .lean();

      // Filter out requests where the user might have been deleted
      const validRequests = leaveRequests.filter(req => req.user);

      return res.status(200).json(validRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      return res.status(500).json({ message: "Failed to fetch leave requests." });
    }
  }

  if (req.method === "PUT") {
    try {
        const { leaveId, status } = req.body;
        if (!leaveId || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid leave ID or status.' });
        }

        await connectDB();

        // Find the leave request first
        const leaveToUpdate = await Leave.findOne({ _id: leaveId, managerEmail: session.user.email });

        if (!leaveToUpdate) {
            return res.status(404).json({ message: 'Leave request not found or you are not authorized to update it.' });
        }

        leaveToUpdate.status = status;
        await leaveToUpdate.save();

        // Re-fetch the updated leave with the user populated to ensure we have the email
        const updatedLeave = await Leave.findById(leaveToUpdate._id)
            .populate({ path: 'user', select: 'name employeeCode email' })
            .lean();

        if (!updatedLeave || !updatedLeave.user) {
            // This case is unlikely if the previous findOne worked, but it's a good safeguard.
            console.error(`Leave ${leaveToUpdate._id} updated, but user not found for email notification.`);
            return res.status(200).json({ ...leaveToUpdate.toObject(), emailWarning: "Leave status updated, but user not found for notification." });
        }
        
        try {
            await sendLeaveStatusUpdateEmailToUser(updatedLeave, updatedLeave.user);
            return res.status(200).json(updatedLeave);
        } catch (emailError) {
            console.error("Leave status updated, but failed to send email:", emailError);
            // Return a success response for the update, but include a warning about the email.
            return res.status(200).json({ ...updatedLeave, emailWarning: "Leave status updated, but failed to send notification email." });
        }
    } catch (error) {
        console.error("Error updating leave status:", error);
        return res.status(500).json({ message: "Failed to update leave status." });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
