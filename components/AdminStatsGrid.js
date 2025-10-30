import { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiUserPlus } from 'react-icons/fi';

const AdminStatCard = ({ title, value, icon, bgColor }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl shadow-lg flex items-center justify-between`}>
    <div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
    {icon && <div className="opacity-50">{icon}</div>}
  </div>
);

const AdminStatsGrid = () => {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users/stats'); // Assuming this API exists and returns { total, approved, pending }
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">Loading stats...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">User Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatCard title="Total Users" value={stats.total} icon={<FiUsers size={48} />} bgColor="bg-blue-500" />
        <AdminStatCard title="Approved Users" value={stats.approved} icon={<FiUserCheck size={48} />} bgColor="bg-green-500" />
        <AdminStatCard title="Pending Requests" value={stats.pending} icon={<FiUserPlus size={48} />} bgColor="bg-yellow-500" />
      </div>
    </div>
  );
};

export default AdminStatsGrid;