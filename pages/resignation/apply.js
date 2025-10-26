import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { FiSend, FiAlertTriangle } from 'react-icons/fi';
import ResignationLayout from '@/components/ResignationLayout';

export default function ApplyResignationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [noticePeriod, setNoticePeriod] = useState(0);
  const [reason, setReason] = useState('Better Opportunity');
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingResignation, setExistingResignation] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // Fetch existing resignation status
    const checkExisting = async () => {
        // This is a placeholder. A dedicated API to get resignation status would be better.
        // For now, we'll rely on the POST API's response.
    };
    if (status === 'authenticated') {
        checkExisting();
    }
  }, [status, router]);

  useEffect(() => {
    if (lastWorkingDay) {
      const today = new Date();
      const lwd = new Date(lastWorkingDay);
      today.setHours(0, 0, 0, 0);
      lwd.setHours(0, 0, 0, 0);
      if (lwd >= today) {
        const diffTime = Math.abs(lwd - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNoticePeriod(diffDays);
      } else {
        setNoticePeriod(0);
      }
    } else {
      setNoticePeriod(0);
    }
  }, [lastWorkingDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lastWorkingDay || !reason) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (reason === 'Others' && !otherReason.trim()) {
      toast.error('Please specify a reason if you select "Others".');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(lastWorkingDay) < today) {
      toast.error('Last working day cannot be in the past.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting your application...');

    try {
      const res = await fetch('/api/resignations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastWorkingDay, reason, otherReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit application.');
      }

      toast.success('Resignation submitted successfully!', { id: loadingToast });
      router.push('/resignation/status');

    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || !session) {
    return <ResignationLayout><p>Loading...</p></ResignationLayout>;
  }

  return (
    <ResignationLayout>
      <Toaster position="top-center" />
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Resignation Application Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto-filled fields */}
            <div>
              <label className="block text-sm font-medium text-gray-500">Employee Name</label>
              <input type="text" value={session.user.name || ''} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Employee Code</label>
              <input type="text" value={session.user.employeeCode || ''} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Designation</label>
              <input type="text" value={session.user.designation || 'N/A'} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Reporting Manager</label>
              <input type="text" value={session.user.assignedManager || 'Not Assigned'} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="lastWorkingDay" className="block text-sm font-medium text-gray-700">Last Working Day</label>
                <input type="date" id="lastWorkingDay" value={lastWorkingDay} onChange={(e) => setLastWorkingDay(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Notice Period (Days)</label>
                <input type="text" value={`${noticePeriod} days`} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Resignation</label>
              <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Better Opportunity</option>
                <option>Personal Reason</option>
                <option>Higher Studies</option>
                <option>Relocation</option>
                <option>Health Issues</option>
                <option>Others</option>
              </select>
            </div>

            {reason === 'Others' && (
              <div>
                <label htmlFor="otherReason" className="block text-sm font-medium text-gray-700">Please Specify Other Reason</label>
                <textarea id="otherReason" rows="4" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Please provide details..."></textarea>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              <FiSend className="mr-2 -ml-1 h-5 w-5" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </ResignationLayout>
  );
}