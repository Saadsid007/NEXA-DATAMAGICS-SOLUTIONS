import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import ResignationLayout from '@/components/ResignationLayout';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';
import { usePendingCounts } from '@/context/PendingCountContext';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    const statusClasses = {
        pending: "bg-yellow-200 text-yellow-800",
        approved: "bg-green-200 text-green-800",
        rejected: "bg-red-200 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const ReasonModal = ({ reason, otherReason, onClose }) => {
    if (!reason) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Reason for Resignation</h3>
                <p className="text-gray-700 whitespace-pre-wrap max-h-80 overflow-y-auto">
                    <b>Reason:</b> {reason}
                    {reason === 'Others' && otherReason && <><br/><b>Details:</b> {otherReason}</>}
                </p>
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

export default function ManageResignationRequests() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const { fetchCounts } = usePendingCounts();

    useEffect(() => {
        if (sessionStatus === 'loading') return;
        if (!session || !['admin', 'manager'].includes(session.user.role)) {
            router.push('/login');
            return;
        }

        const fetchRequests = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/resignations/manage');
                if (!res.ok) throw new Error('Failed to fetch resignation requests.');
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [session, sessionStatus, router]); // fetchCounts is stable, no need to add

    const handleStatusUpdate = async (resignationId, newStatus) => {
        const originalRequests = [...requests];
        setRequests(requests.map(req => req._id === resignationId ? { ...req, status: newStatus } : req));

        try {
            const res = await fetch('/api/resignations/manage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resignationId, status: newStatus }),
            });

            if (!res.ok) {
                setRequests(originalRequests);
                const errorData = await res.json();
                throw new Error(errorData.message);
            }
            toast.success(`Request has been ${newStatus}.`);
            fetchCounts(); // Refresh counts in sidebar
        } catch (error) {
            toast.error(`Error: ${error.message}`);
            setRequests(originalRequests);
        }
    };

    if (sessionStatus === 'loading' || loading) {
        return <ResignationLayout><div className="text-center p-10">Loading Requests...</div></ResignationLayout>;
    }

    return (
        <ResignationLayout>
            <Toaster position="top-center" />
            <ReasonModal reason={selectedRequest?.reason} otherReason={selectedRequest?.otherReason} onClose={() => setSelectedRequest(null)} />
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resignation Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Working Day</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">No resignation requests found.</td></tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{req.user.name}</div>
                                            <div className="text-sm text-gray-500">{req.user.employeeCode}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(req.resignationDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(req.lastWorkingDay).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <button onClick={() => setSelectedRequest(req)} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1" title="Click to view full reason">
                                                <FiEye/> View
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleStatusUpdate(req._id, 'approved')} className="text-green-600 hover:text-green-900 flex items-center gap-1"><FiCheck/> Approve</button>
                                                    <button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="text-red-600 hover:text-red-900 flex items-center gap-1"><FiX/> Reject</button>
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
        </ResignationLayout>
    );
}