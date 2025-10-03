import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';
import Image from 'next/image';
import { FiMenu } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
      {/* Left side: Hamburger Menu (for mobile) and Company Name (for desktop) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open sidebar"
        >
          <FiMenu size={22} />
        </button>
        <h1 className="hidden sm:block text-xl font-bold text-gray-800 tracking-wider">
          NEXA DATAMAGICS SOLUTIONS
        </h1>
      </div>
      
      {/* Right User Info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-gray-800">Welcome, {session?.user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{session?.user?.role} Access</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-blue-500 overflow-hidden">
          {session?.user?.profileImage ? (
            <Image
              src={session.user.profileImage}
              alt="Profile Picture"
              width={50}
              height={50}
              className="object-cover w-full h-full"
              priority
            />
          ) : <FaUserCircle className="text-gray-400 text-2xl" />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;