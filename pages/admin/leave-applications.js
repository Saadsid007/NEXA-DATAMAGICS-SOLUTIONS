import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

export default function LeaveApplications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = session?.user?.role === 'admin';

  // Fetch leave applications assigned to the manager
  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaves/manager-view');
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      } else {
        toast.error('Failed to fetch leave applications.');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.push('/dashboard');
    } else {
      fetchLeaves();
    }
  }, [status, isAdmin, router]);

  const handleUpdateStatus = async (leaveId, newStatus) => {
    const originalLeaves = [...leaves];
    // Optimistically update UI
    setLeaves(leaves.map(l => l._id === leaveId ? { ...l, status: newStatus } : l));

    try {
      const res = await fetch('/api/leaves/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveId, status: newStatus }),
      });

      if (!res.ok) {
        // Revert UI on failure
        setLeaves(originalLeaves);
        const errorData = await res.json();
        toast.error(errorData.message || `Failed to ${newStatus.toLowerCase()} leave.`);
      } else {
        toast.success(`Leave successfully ${newStatus.toLowerCase()}ed!`);
        // Re-fetch to ensure data consistency
        fetchLeaves();
      }
    } catch (error) {
      // Revert UI on error
      setLeaves(originalLeaves);
      toast.error('An error occurred.');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'Rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  if (isLoading) return <p>Loading applications...</p>;

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Leave Applications</h1>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{leave.employeeName}</div>
                      <div className="text-sm text-gray-500">{leave.employeeCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.leaveType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}</td>
                    <td className="px-6 py-4 max-w-xs whitespace-normal text-sm text-gray-500 truncate">{leave.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(leave.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {leave.status === 'Pending' && (
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleUpdateStatus(leave._id, 'Approved')} className="text-green-600 hover:text-green-900" title="Approve">
                            <FiCheckCircle size={20} />
                          </button>
                          <button onClick={() => handleUpdateStatus(leave._id, 'Rejected')} className="text-red-600 hover:text-red-900" title="Reject">
                            <FiXCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No leave applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}