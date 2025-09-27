import { useSession, signOut } from "next-auth/react";
import { FaHourglassHalf, FaSignOutAlt } from "react-icons/fa";

export default function PendingApproval() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-lg">
        <FaHourglassHalf className="text-yellow-500 text-6xl mx-auto mb-5 animate-spin" style={{ animationDuration: '3s' }} />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Account Pending Approval</h1>
        <p className="text-gray-700 text-lg mb-4">
          Hi {session?.user?.name || "there"}, your account has been registered and is currently waiting for admin approval.
        </p>
        <p className="text-gray-600 mb-8">
          You will be able to access your dashboard once an administrator reviews and approves your registration. Please check back later.
        </p>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })} 
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}
