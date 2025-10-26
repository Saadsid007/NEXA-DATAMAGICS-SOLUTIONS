import { useState, useEffect, useCallback } from "react";
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
  FiMenu,
  FiUserCheck,
  FiBriefcase,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { usePendingCounts } from "@/context/PendingCountContext";

const Sidebar = ({ isPinned, setIsPinned }) => {
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState('');
  const { counts, fetchCounts } = usePendingCounts();
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const isOpen = isPinned || isHovered;

  const isAdmin = session?.user?.role === "admin";
  const isManager = session?.user?.role === "manager";

  useEffect(() => {
    if (isAdmin || isManager) {
      fetchCounts();
    }
  }, [isAdmin, isManager, fetchCounts]);

  const setIsOpen = useCallback((open) => {
    setIsPinned(open);
  }, [setIsPinned]);

  let navLinks = [];

  if (isAdmin) {
    navLinks = [
      { name: "Dashboard", href: "/admin", icon: FiGrid },
      { name: "My Profile", href: "/admin/profile", icon: FiUser },
      { name: "Pending Requests", href: "/admin/pending-requests", icon: FiUserCheck, count: counts.users },
      { name: "All Users", href: "/admin/users", icon: FiUsers },
      { 
        name: "Leaves", 
        icon: FiFileText,
        subLinks: [
          { name: "Manage Requests", href: "/admin/manage-leaves", roles: ['admin'], count: counts.leaves }
        ]
      }
    ];
  } else if (isManager) {
    navLinks = [
      { name: "Dashboard", href: "/manager", icon: FiGrid },
      { name: "My Profile", href: "/profile", icon: FiUser },
      { name: "Assigned Users", href: "/manager/user-assigned", icon: FiUsers },
      { 
        name: "Leaves", 
        icon: FiFileText,
        subLinks: [
          { name: "Apply", href: "/leave-application" },
          { name: "My History", href: "/manager/my-leaves" },
          { name: "Manage Requests", href: "/manager/leave-requests", roles: ['manager'], count: counts.leaves }
        ]
      }
    ];
  }else {
    navLinks = [
      { name: "Dashboard", href: "/dashboard", icon: FiGrid },
      { name: "My Profile", href: "/profile", icon: FiUser },
      { 
        name: "Leaves", 
        icon: FiFileText,
        subLinks: [
          { name: "Apply", href: "/leave-application" },
          { name: "My History", href: "/user/my-leaves" }
        ]
      }
    ];
  }

  // Add Resignation dropdown based on role
  const resignationSubLinks = [];
  if (!isAdmin) {
    resignationSubLinks.push({ name: "Apply", href: "/resignation/apply" });
    resignationSubLinks.push({ name: "Status", href: "/resignation/status" });
  }
  if (isAdmin || isManager) {
    resignationSubLinks.push({ name: "Manage Requests", href: "/resignation/manage", roles: ['admin', 'manager'], count: counts.resignations });
  }

  if (resignationSubLinks.length > 0) {
    navLinks.push({ name: "Resignation", icon: FiBriefcase, subLinks: resignationSubLinks });
  }


  const handleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? '' : name);
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>
      {/* Sidebar */}
      <div
        className={`fixed lg:relative flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out h-full z-40 ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0 lg:w-20"
        }`}
        onMouseEnter={() => {
          if (!isPinned) setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
          <h1 className={`font-bold text-xl overflow-hidden whitespace-nowrap transition-all ${!isOpen && "lg:w-0 lg:opacity-0"}`}>
            {isOpen ? session?.user?.name : 'App'}
          </h1>
          <button 
            onClick={() => setIsPinned(!isPinned)} 
            className="p-2 rounded-lg hover:bg-gray-700 relative group"
            title={isPinned ? "Collapse sidebar" : "Keep sidebar expanded"}
          >
            {isPinned ? <FiChevronsLeft size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navLinks.map((link) =>
            link.subLinks ? (
              <div key={link.name}>
                <button
                  onClick={() => handleDropdown(link.name)}
                  className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white`}
                >
                  <div className="flex items-center">
                    <div className={`transition-all duration-300 ${isOpen ? 'w-5' : 'w-10 flex justify-center'}`}>
                      <link.icon size={20} />
                    </div>
                    <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-200 ${!isOpen && "lg:opacity-0 lg:w-0"}`}>{link.name}</span>
                  </div>
                  {isOpen && (openDropdown === link.name ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />)}
                </button>
                {isOpen && openDropdown === link.name && (
                  <div className="pl-8 mt-1 space-y-1">
                    {link.subLinks.map((subLink) => {
                      if (subLink.roles && !subLink.roles.includes(session?.user?.role)) return null;
                      const totalSubLinkCount = link.subLinks.reduce((acc, sl) => acc + (sl.count || 0), 0);
                      return (
                        <Link 
                          key={subLink.href} 
                          href={subLink.href}
                          className={`block p-2 text-sm rounded-lg ${router.pathname === subLink.href ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
                          onClick={() => setIsOpen(window.innerWidth > 1024 ? isOpen : false)}>
                          {subLink.name}
                          {subLink.count > 0 && (
                            <span className="ml-auto bg-yellow-500 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center float-right">
                              {subLink.count}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                    
                   </div>
                )}
              </div>
            ) : (
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
                <div className={`transition-all duration-300 ${isOpen ? 'w-5' : 'w-10 flex justify-center'}`}>
                  <link.icon size={20} />
                </div>
                <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-200 ${!isOpen && "lg:opacity-0 lg:w-0"}`}>
                  {link.name}
                </span>
                {link.count > 0 && isOpen && (
                  <span className="ml-auto bg-yellow-500 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {link.count}
                  </span>
                )}
              </Link>
            )
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full p-3 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white"
          >
            <div className={`transition-all duration-300 ${isOpen ? 'w-5' : 'w-10 flex justify-center'}`}>
              <FiLogOut size={20} />
            </div>
            <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-200 ${!isOpen && "lg:opacity-0 lg:w-0"}`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
