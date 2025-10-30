import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiCalendar } from 'react-icons/fi';

const StatInfoCard = ({ icon, label, value, colorClass }) => {
  const isLow = typeof value === 'number' && value <= 0;
  const valueColor = isLow ? 'text-red-600' : 'text-gray-800';

  return (
    <div className={`bg-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center gap-4 border-l-4 ${colorClass}`}>
      <div className="text-2xl sm:text-3xl">{icon}</div>
      <div>
        <div className="text-gray-500 text-sm">{label}</div>
        <div className={`text-xl sm:text-2xl font-bold ${valueColor}`}>{value}</div>
      </div>
    </div>
  );
};

const QuickStats = () => {
  const { data: session } = useSession();
  const [leaveStats, setLeaveStats] = useState({ remainingLeaves: '...' });

  useEffect(() => {
    const fetchLeaveStats = async () => {
      if (session) {
        try {
          const res = await fetch('/api/leaves/user-stats');
          if (res.ok) {
            const data = await res.json();
            setLeaveStats(data);
          } else {
            setLeaveStats({ remainingLeaves: 'N/A' });
          }
        } catch (error) {
          console.error("Failed to fetch leave stats:", error);
          setLeaveStats({ remainingLeaves: 'N/A' });
        }
      }
    };

    fetchLeaveStats();
  }, [session]);

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatInfoCard icon={<FiCalendar />} label="Leaves Remaining" value={leaveStats.remainingLeaves} colorClass="border-cyan-500" />
      </div>
    </div>
  );
};

export default QuickStats;