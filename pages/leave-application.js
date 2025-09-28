import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { FiCalendar, FiFileText, FiSend } from 'react-icons/fi';

export default function LeaveApplicationPage() {
  const { data: session, status } = useSession();
  const [managerName, setManagerName] = useState('');
  const router = useRouter();

  // Form state
    const [leaveType, setLeaveType] = useState('Planned Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchManager = async () => {
      if (session?.user?.assignedManager) {
        try {
          const res = await fetch(`/api/users/by-email?email=${session.user.assignedManager}`);
          if (res.ok) {
            const managerData = await res.json();
            setManagerName(managerData.name || 'Unknown Manager');
          } else {
            setManagerName('Unknown Manager');
            toast.error('Could not fetch manager details.');
          }
        } catch (error) {
          console.error('Failed to fetch manager name:', error);
          setManagerName('Unknown Manager');
          toast.error('Failed to fetch manager details.');
        }
      } else {
        setManagerName('No Manager Assigned');
      }
    };

    if (session) {
      fetchManager();
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill all the fields.');
      return;
    }

    // Past date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of today for accurate comparison
    if (new Date(startDate) < today) {
      toast.error('Start date cannot be in the past.');
      return;
    }

    // End date validation
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before the start date.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting your application...');

    try {
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      });

      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success('Leave application submitted successfully!');
        // Reset form
        setLeaveType('Planned Leave');
        setStartDate('');
        setEndDate('');
        setReason('');
      } else {
        const errorData = await res.json();
        toast.dismiss(loadingToast);
        toast.error(errorData.message || 'Failed to submit application.');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An error occurred. Please try again.');
      console.error('Leave submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

   if (status === 'loading' || !session) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">Apply for Leave</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pre-filled fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee Name
              </label>
              <input
                type="text"
                value={session.user.name || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee Code
              </label>
              <input
                type="text"
                value={session.user.employeeCode || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Assign Manager</label>
              <input type="text" value={session.user.assignedManager || 'Not Assigned'} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>

          {/* Form fields */}
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select id="leaveType" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Planned Leave</option>
              <option>Unplanned Leave</option>
              <option>Sick Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Leave</label>
            <textarea id="reason" rows="4" value={reason} onChange={(e) => setReason(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Please provide a brief reason for your leave..."></textarea>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
              <FiSend className="mr-2 -ml-1 h-5 w-5" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}