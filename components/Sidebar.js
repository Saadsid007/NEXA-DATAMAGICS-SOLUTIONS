import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  FiGrid,
  FiUser,
  FiUsers,
  FiLogOut,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
  FiUserCheck,
} from "react-icons/fi";

const Sidebar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      const fetchPendingCount = async () => {
        try {
          const res = await fetch('/api/users/pending');
          if (res.ok) {
            const data = await res.json();
            setPendingCount(data.length);
          }
        } catch (error) {
          console.error("Failed to fetch pending count:", error);
        }
      };

      fetchPendingCount();
    }
  }, [isAdmin]);

  let navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: FiGrid },
    { name: "My Profile", href: "/profile", icon: FiUser },
  ];

  if (isAdmin) {
    // Admin/Manager specific links
    navLinks.push(
      { name: "Leave Applications", href: "/admin/leave-applications", icon: FiFileText },
      { name: "Pending Requests", href: "/admin/pending-requests", icon: FiUserCheck },
      { name: "All Users", href: "/admin/users", icon: FiUsers }
    );
  } else {
    // Regular user specific links
    navLinks.push(
      { name: "Apply for Leave", href: "/leave-application", icon: FiFileText }
    );
  }

  return (
    <div
      className={`relative flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className={`font-bold text-xl overflow-hidden ${!isOpen && "w-0"}`}>
          {isAdmin ? session?.user?.name : session?.user?.name}
        </h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-gray-700">
          {isOpen ? <FiChevronsLeft size={20} /> : <FiChevronsRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between p-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white"
          >
            <div className="flex items-center">
              <link.icon size={20} />
              <span className={`ml-4 transition-opacity duration-200 ${!isOpen && "opacity-0 hidden"}`}>
                {link.name}
              </span>
            </div>
            {link.name === "Pending Requests" && pendingCount > 0 && isOpen && (
              <span className="bg-yellow-500 text-gray-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center w-full p-2 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white"
        >
          <FiLogOut size={20} />
          <span className={`ml-4 transition-opacity duration-200 ${!isOpen && "opacity-0 hidden"}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
