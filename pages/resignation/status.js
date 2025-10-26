import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import ResignationLayout from '@/components/ResignationLayout';
import { FiLoader, FiInfo, FiCalendar, FiFileText, FiClock, FiAlertCircle } from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full inline-block";
  const statusInfo = {
    pending: { text: "Pending", classes: "bg-yellow-100 text-yellow-800" },
    approved: { text: "Approved", classes: "bg-green-100 text-green-800" },
    rejected: { text: "Rejected", classes: "bg-red-100 text-red-800" },
  };
  const { text, classes } = statusInfo[status] || { text: "Unknown", classes: "bg-gray-100 text-gray-800" };
  return <span className={`${baseClasses} ${classes}`}>{text}</span>;
};

const InfoCard = ({ label, value, icon: Icon }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center">
      <Icon className="h-6 w-6 text-gray-500 mr-3" />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

export default function ResignationStatusPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }

    if (sessionStatus === 'authenticated') {
      const fetchStatus = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/resignations');
          if (res.ok) {
            const data = await res.json();
            setResignation(data);
          } else if (res.status === 404) {
            setResignation(null);
          } else {
            throw new Error('Failed to fetch resignation status.');
          }
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchStatus();
    }
  }, [sessionStatus, router]);

  if (loading || sessionStatus === 'loading') {
    return (
      <ResignationLayout>
        <div className="text-center py-20">
          <FiLoader className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading your resignation status...</p>
        </div>
      </ResignationLayout>
    );
  }

  return (
    <ResignationLayout>
      <Toaster position="top-center" />
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Resignation Status</h2>
        {resignation ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-800">Current Status</h3>
              <StatusBadge status={resignation.status} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard label="Resignation Date" value={new Date(resignation.resignationDate).toLocaleDateString()} icon={FiCalendar} />
              <InfoCard label="Proposed Last Working Day" value={new Date(resignation.lastWorkingDay).toLocaleDateString()} icon={FiCalendar} />
              <InfoCard label="Notice Period" value={`${resignation.noticePeriod} days`} icon={FiClock} />
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center"><FiFileText className="mr-2"/>Reason for Resignation</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-800">{resignation.reason}</p>
                {resignation.reason === 'Others' && resignation.otherReason && (
                  <p className="text-gray-600 mt-1 pl-4 border-l-2 border-gray-300">{resignation.otherReason}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Application Found</h3>
            <p className="mt-1 text-sm text-gray-500">You have not submitted a resignation application yet.</p>
          </div>
        )}
      </div>
    </ResignationLayout>
  );
}
