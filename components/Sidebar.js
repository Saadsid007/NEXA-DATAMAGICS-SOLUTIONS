import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import {
  FiGrid,
  FiUser,
  FiUsers,
  FiLogOut,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
  FiUserCheck,
  FiX,
} from "react-icons/fi";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { data: session } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  const isAdmin = session?.user?.role === "admin";
  const isManager = session?.user?.role === "manager";

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
    navLinks = [
      { name: "Dashboard", href: "/admin", icon: FiGrid },
      { name: "My Profile", href: "/admin/profile", icon: FiUser },
      { name: "Pending Requests", href: "/admin/pending-requests", icon: FiUserCheck },
      { name: "All Users", href: "/admin/users", icon: FiUsers },
      { name: "Manage Leaves", href: "/admin/manage-leaves", icon: FiFileText }
    ];
  } else if (isManager) {
    navLinks = [
      { name: "Dashboard", href: "/manager", icon: FiGrid },
      { name: "My Profile", href: "/profile", icon: FiUser },
      {name: "Apply for Leave", href: "/leave-application", icon: FiFileText },
      { name: "My Leaves", href: "/manager/my-leaves", icon: FiFileText },
      { name: "Assigned Users", href: "/manager/user-assigned", icon: FiUsers },
      { name: "Manage Leaves", href: "/manager/leave-requests", icon: FiFileText },
    ];
  }else {
    // Regular user specific links
    navLinks.push(
      { name: "Apply for Leave", href: "/leave-application", icon: FiFileText },
      { name: "My Leaves", href: "/user/my-leaves", icon: FiFileText }
    );
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative flex flex-col bg-gray-800 text-white transition-transform duration-300 ease-in-out h-full z-40 ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0 lg:w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
          <h1 className={`font-bold text-xl overflow-hidden whitespace-nowrap transition-all ${!isOpen && "lg:w-0 lg:opacity-0"}`}>
            {session?.user?.name}
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
              className={`flex items-center p-3 rounded-lg transition-colors ${
                router.pathname === link.href
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setIsOpen(window.innerWidth > 1024 ? isOpen : false)}
            >
              <link.icon size={20} />
              <span className={`ml-4 transition-opacity duration-200 ${!isOpen && "lg:opacity-0 lg:hidden"}`}>
                {link.name}
              </span>
              {link.name === "Pending Requests" && pendingCount > 0 && isOpen && (
                <span className="ml-auto bg-yellow-500 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full p-3 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white"
          >
            <FiLogOut size={20} />
            <span className={`ml-4 transition-opacity duration-200 ${!isOpen && "lg:opacity-0 lg:hidden"}`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
