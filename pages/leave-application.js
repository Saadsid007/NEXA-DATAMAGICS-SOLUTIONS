import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { FiSend, FiPaperclip, FiX } from 'react-icons/fi';
import LeaveLayout from '@/components/LeaveLayout';

export default function LeaveApplicationPage() {
  const { data: session, status } = useSession();
  const [managerName, setManagerName] = useState('');
  const router = useRouter();

  // Form state
    const [leaveType, setLeaveType] = useState('Planned Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveStats, setLeaveStats] = useState({ hasPendingLeave: false, remainingLeaves: 2 });
  const [totalDays, setTotalDays] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Calculate total leave days excluding weekends
  useEffect(() => {
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            setTotalDays(0);
            return;
        }

        let count = 0;
        const current = new Date(start);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        setTotalDays(count);
    } else {
        setTotalDays(0);
    }
}, [startDate, endDate]);

  useEffect(() => {
    const fetchLeaveStats = async () => {
      if (session) {
        try {
          const res = await fetch('/api/leaves/user-stats');
          if (res.ok) {
            const data = await res.json();
            setLeaveStats(data);
          }
        } catch (error) {
          console.error("Failed to fetch leave stats:", error);
        }
      }
    };

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
      fetchLeaveStats();
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (leaveStats.hasPendingLeave) {
      toast.error('You already have a pending leave request. Please wait for it to be processed.');
      return;
    }
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

    const formData = new FormData();
    formData.append('leaveType', leaveType);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('reason', reason);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success('Leave application submitted successfully!');
        setLeaveType('Planned Leave');
        setStartDate('');
        setEndDate('');
        setReason('');
        setAttachment(null);
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
    return <LeaveLayout><p>Loading...</p></LeaveLayout>;
  }

  return (
    <LeaveLayout>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Leave Application Form</h2>
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Remaining Leaves This Month</label>
              <input 
                type="text" 
                value={leaveStats.remainingLeaves} 
                disabled 
                className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm font-bold ${leaveStats.remainingLeaves < 0 ? 'text-red-600' : 'text-green-600'}`} />
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
              <label className="block text-sm font-medium text-gray-700">Total Leave Days (excluding weekends)</label>
              <input 
                type="text" 
                value={`${totalDays} day(s)`} 
                disabled 
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm font-semibold text-center" />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Leave</label>
            <textarea id="reason" rows="4" value={reason} onChange={(e) => setReason(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Please provide a brief reason for your leave..."></textarea>
          </div>

          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">Attach a file (optional)</label>
            <div className="mt-1">
              {!attachment ? (
                <label htmlFor="attachment-input" className="relative flex w-full justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 transition hover:border-indigo-500 cursor-pointer">
                  <div className="space-y-1 text-center">
                    <FiPaperclip className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  <input id="attachment-input" name="attachment" type="file" onChange={(e) => setAttachment(e.target.files[0])} className="sr-only" />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
                  <button type="button" onClick={() => setAttachment(null)} className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"><FiX /></button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting || leaveStats.hasPendingLeave} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed" title={leaveStats.hasPendingLeave ? 'You have a pending request' : ''}>
              <FiSend className="mr-2 -ml-1 h-5 w-5" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </LeaveLayout>
  );
}