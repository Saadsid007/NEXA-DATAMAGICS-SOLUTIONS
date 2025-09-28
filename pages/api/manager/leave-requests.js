import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { connectDB } from "@/lib/mongodb";
import Leave from "@/models/Leave";
import User from "@/models/User"; // To populate user details

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
          path: 'user',
          select: 'name employeeCode' // Select which user fields to return
        })
        .sort({ createdAt: -1 }) // Show newest first
        .lean();

      return res.status(200).json(leaveRequests);
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

        const updatedLeave = await Leave.findOneAndUpdate(
            { _id: leaveId, managerEmail: session.user.email }, // Ensure manager can only update their own requests
            { status },
            { new: true }
        ).populate({ path: 'user', select: 'name employeeCode' });

        if (!updatedLeave) {
            return res.status(404).json({ message: 'Leave request not found or you are not authorized to update it.' });
        }

        // TODO: Implement email notification to the user (updatedLeave.user.email) about the status update.

        return res.status(200).json(updatedLeave);

    } catch (error) {
        console.error("Error updating leave status:", error);
        return res.status(500).json({ message: "Failed to update leave status." });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
