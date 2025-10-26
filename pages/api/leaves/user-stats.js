import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from '@/lib/mongodb';
import Leave from '@/models/Leave';
import { calculateLeaveDays } from "@/lib/dateUtils";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await connectDB();

        const userId = session.user.id;

        // 1. Check for any pending leave requests
        const pendingLeave = await Leave.findOne({ user: userId, status: 'pending' });

        // 2. Calculate remaining leaves, considering carry-over from the previous month.
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const monthlyQuota = 2;

        // Calculate leaves taken in the previous month
        const approvedLeavesLastMonth = await Leave.find({
            user: userId,
            status: 'approved',
            startDate: { $lte: endOfPreviousMonth },
            endDate: { $gte: startOfPreviousMonth }
        });

        // Calculate total leave days taken in the previous month, excluding weekends
        const lastMonthLeavesTaken = approvedLeavesLastMonth.reduce((total, leave) => {
            const leaveStart = new Date(Math.max(new Date(leave.startDate), startOfPreviousMonth));
            const leaveEnd = new Date(Math.min(new Date(leave.endDate), endOfPreviousMonth));
            return total + calculateLeaveDays(leaveStart, leaveEnd);
        }, 0);

        const lastMonthBalance = monthlyQuota - lastMonthLeavesTaken;

        // Determine carry-over leaves. If last month's balance is negative, it resets to 0 for this month's calculation.
        const carryOverLeaves = lastMonthBalance > 0 ? lastMonthBalance : 0;

        // Calculate leaves taken in the current month
        const approvedLeavesThisMonth = await Leave.find({
            user: userId,
            status: 'approved',
            startDate: { $lte: endOfMonth },
            endDate: { $gte: startOfMonth }
        });

        const leavesTaken = approvedLeavesThisMonth.reduce((total, leave) => {
            const leaveStart = new Date(Math.max(new Date(leave.startDate), startOfMonth));
            const leaveEnd = new Date(Math.min(new Date(leave.endDate), endOfMonth));
            return total + calculateLeaveDays(leaveStart, leaveEnd);
        }, 0);
        
        // Current month's quota is the base quota plus any carry-over.
        const currentMonthQuota = monthlyQuota + carryOverLeaves;
        const remainingLeaves = currentMonthQuota - leavesTaken;

        res.status(200).json({ hasPendingLeave: !!pendingLeave, remainingLeaves: remainingLeaves });

    } catch (error) {
        console.error("Error fetching user leave stats:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
