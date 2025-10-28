import Link from "next/link";
import { FaSignInAlt, FaUserPlus, FaBuilding } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-200 flex flex-col justify-center items-center p-4">
      <div className="text-center bg-white/70 backdrop-blur-sm p-8 sm:p-12 rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200">
        <div className="flex justify-center items-center gap-4 mb-6">
          <FaBuilding className="text-blue-600 text-5xl" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-wide">
            NEXA DATAMAGICS SOLUTIONS
          </h2>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Welcome to the Employee Portal
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Efficiently manage user data, onboard new employees, and streamline your workflow.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/login" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg">
            <FaSignInAlt /> Login
          </Link>
          <Link href="/register" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg">
            <FaUserPlus /> Register
          </Link>
        </div>
      </div>
    </div>
  );
}
