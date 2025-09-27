import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiUser, FiFileText } from "react-icons/fi";

export default function Dashboard() {
  const { data: session, status } = useSession();

  // Middleware now handles all redirection. We just need a loading state.
  if (status === "loading") {
    return <p>Loading...</p>;
  }
  
  return (
    <>
    <Navbar />
    <Marquee />
    <div className="p-6">
      <div className="bg-white p-8 rounded-xl shadow-md mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hello, {session.user.name}!</h1>
        <p className="text-gray-600 mt-2">Welcome to your personal dashboard. Here are some quick links to get you started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/profile" className="block p-6 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <FiUser className="text-blue-500 text-4xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
                <p className="text-gray-600">View and manage your personal information.</p>
              </div>
            </div>
        </Link>
        <Link href="/leave-application" className="block p-6 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <FiFileText className="text-green-500 text-4xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Apply for Leave</h2>
                <p className="text-gray-600">Submit and track your leave requests.</p>
              </div>
            </div>
        </Link>
      </div>
    </div>
    </>
  );
}
