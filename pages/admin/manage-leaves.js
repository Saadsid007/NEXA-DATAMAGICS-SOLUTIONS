import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';

const LeaveStatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    const statusClasses = {
        pending: "bg-yellow-200 text-yellow-800",
        approved: "bg-green-200 text-green-800",
        rejected: "bg-red-200 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const ReasonModal = ({ reason, onClose }) => {
    if (!reason) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Full Reason for Leave</h3>
                <p className="text-gray-700 whitespace-pre-wrap max-h-80 overflow-y-auto">{reason}</p>
                <div className="text-right mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ManageLeaveRequestsAdmin() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReason, setSelectedReason] = useState(null);

    useEffect(() => {
        if (sessionStatus === 'loading') return;
        if (!session || session.user.role !== 'admin') {
            router.push('/login');
            return;
        }

        const fetchRequests = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/leave-requests');
                if (!res.ok) throw new Error('Failed to fetch leave requests.');
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [session, sessionStatus, router]);

    const handleStatusUpdate = async (leaveId, newStatus) => {
        const originalRequests = [...requests];
        setRequests(requests.map(req => req._id === leaveId ? { ...req, status: newStatus } : req));

        try {
            const res = await fetch('/api/admin/leave-requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leaveId, status: newStatus }),
            });

            if (!res.ok) {
                setRequests(originalRequests);
                const errorData = await res.json();
                throw new Error(errorData.message);
            }
            toast.success(`Request has been ${newStatus}.`);
        } catch (error) {
            toast.error(`Error: ${error.message}`);
            setRequests(originalRequests);
        }
    };

    if (sessionStatus === 'loading' || loading) {
        return <div className="text-center p-10">Loading Requests...</div>;
    }

    return (
        <>
            <Toaster position="top-center" />
            <ReasonModal reason={selectedReason} onClose={() => setSelectedReason(null)} />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Leave Requests</h1>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-10 text-gray-500">No leave requests found.</td></tr>
                                    ) : (
                                        requests.map(req => (
                                            <tr key={req._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{req.user.name}</div>
                                                    <div className="text-sm text-gray-500">{req.user.employeeCode}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{req.leaveType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                                    <button onClick={() => setSelectedReason(req.reason)} className="text-left w-full truncate hover:text-indigo-600 focus:outline-none cursor-pointer" title="Click to view full reason">{req.reason}</button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap"><LeaveStatusBadge status={req.status} /></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {req.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleStatusUpdate(req._id, 'approved')} className="text-green-600 hover:text-green-900">Approve</button>
                                                            <button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}