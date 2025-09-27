import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
      {/* Left spacer to push title to center */}
      <div className="flex-1"></div>
      
      {/* Centered Company Name */}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold text-gray-800 tracking-wider">
          NEXA DATAMAGICS SOLUTIONS
        </h1>
      </div>

      {/* Right User Info */}
      <div className="flex-1 flex items-center gap-4 justify-end">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">Welcome, {session?.user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-blue-500"><FaUserCircle className="text-gray-400 text-2xl" /></div>
      </div>
    </header>
  );
};

export default Navbar;