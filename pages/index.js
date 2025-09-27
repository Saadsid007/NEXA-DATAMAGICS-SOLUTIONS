import Link from "next/link";
import { FaUsers, FaSignInAlt, FaUserPlus } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col justify-center items-center p-4">
      <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-2xl w-full">
        <FaUsers className="text-blue-500 text-6xl mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Welcome to the User Management System
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Efficiently manage user data, onboard new employees, and streamline your workflow.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/login" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-transform transform hover:scale-105">
            <FaSignInAlt /> Login
          </Link>
          <Link href="/register" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-transform transform hover:scale-105">
            <FaUserPlus /> Register
          </Link>
        </div>
      </div>
    </div>
  );
}
