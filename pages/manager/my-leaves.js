import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';

// A reusable component for status badges
const LeaveStatusBadge = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-sm font-medium rounded-full inline-block";
    const statusClasses = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
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

export default function MyLeavesPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReason, setSelectedReason] = useState(null);

    useEffect(() => {
        if (sessionStatus === 'loading') return;
        if (sessionStatus === 'unauthenticated') {
            router.push('/login');
            return;
        }

        const fetchLeaves = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/leaves/my-leaves');
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to fetch your leave history.');
                }
                const data = await res.json();
                setLeaves(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchLeaves();
        }
    }, [session, sessionStatus, router]);

    if (sessionStatus === 'loading' || loading) {
        return <div className="text-center p-10">Loading your leave history...</div>;
    }

    return (
        <>
            <Toaster position="top-center" />
            <ReasonModal reason={selectedReason} onClose={() => setSelectedReason(null)} />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">My Leave History</h1>
                    
                    {leaves.length === 0 ? (
                        <div className="text-center bg-white p-12 rounded-lg shadow-md">
                            <p className="text-gray-500 text-lg">You have not applied for any leaves yet.</p>
                            <button 
                                onClick={() => router.push('/leave-application')}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                            >
                                Apply for Leave
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {leaves.map(leave => (
                                            <tr key={leave._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{leave.leaveType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                                    <button 
                                                        onClick={() => setSelectedReason(leave.reason)} 
                                                        className="text-left w-full truncate hover:text-indigo-600 focus:outline-none cursor-pointer"
                                                        title="Click to view full reason"
                                                    >
                                                        {leave.reason}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <LeaveStatusBadge status={leave.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}