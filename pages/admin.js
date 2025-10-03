import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiUsers, FiUserCheck, FiUserPlus } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Marquee from "@/components/Marquee";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin";
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.push('/dashboard'); // Redirect if not an admin
    } else {
      // Fetch stats for the dashboard
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/users/stats');
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        }
      };
      fetchStats();
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || !isAdmin) return <p>Loading...</p>;
  
  return (
    <>
    <Marquee />
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Total Users</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>
          <FiUsers size={48} className="opacity-50" />
        </div>
        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Approved Users</p>
            <p className="text-4xl font-bold">{stats.approved}</p>
          </div>
          <FiUserCheck size={48} className="opacity-50" />
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Pending Requests</p>
            <p className="text-4xl font-bold">{stats.pending}</p>
          </div>
          <FiUserPlus size={48} className="opacity-50" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/pending-requests" className="flex-1 min-w-[200px] text-center bg-blue-100 text-blue-800 font-semibold py-4 px-6 rounded-lg hover:bg-blue-200 transition-colors">
            Manage Pending Requests
          </Link>
          <Link href="/admin/users" className="flex-1 min-w-[200px] text-center bg-green-100 text-green-800 font-semibold py-4 px-6 rounded-lg hover:bg-green-200 transition-colors">
            View All Users
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
