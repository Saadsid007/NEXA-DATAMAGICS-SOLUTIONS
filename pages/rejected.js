import { useSession, signOut } from "next-auth/react";
import { FaTimesCircle, FaSignOutAlt, FaBuilding } from "react-icons/fa";

export default function RejectedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-4">
      <div className="text-center mb-6">
        <FaBuilding className="inline-block text-blue-600 text-4xl mb-2" />
        <h2 className="text-2xl font-bold text-gray-700">NEXA DATAMAGICS SOLUTIONS</h2>
      </div>
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-lg">
        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-5" />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Registration Rejected</h1>
        <p className="text-gray-700 text-lg mb-4">
          Hi {session?.user?.name || "there"}, we regret to inform you that your registration request has been rejected.
        </p>
        <p className="text-gray-600 mb-8">
          If you believe this is a mistake, please contact your administrator for more information.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          <FaSignOutAlt /> Logout and Go to Login
        </button>
      </div>
    </div>
  );
}