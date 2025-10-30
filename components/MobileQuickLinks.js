import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiChevronDown, FiChevronUp, FiLink } from 'react-icons/fi';

const MobileQuickLinks = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [isOpen, setIsOpen] = useState(false);

  const allActions = [
    { title: 'My Profile', href: userRole === 'admin' ? '/admin/profile' : '/profile', roles: ['admin', 'manager', 'user'] },
    { title: 'Apply for Leave', href: '/leave-application', roles: ['manager', 'user'] },
    { title: 'Manage Leaves', href: userRole === 'admin' ? '/admin/manage-leaves' : '/manager/leave-requests', roles: ['admin', 'manager'] },
    { title: 'My Gallery', href: '/gallery', roles: ['admin', 'manager', 'user'] },
    { title: 'My Tasks', href: '/tasks', roles: ['admin', 'manager', 'user'] },
    { title: 'Manage Company Info', href: '/admin/company-info', roles: ['admin'] },
    { title: 'Manage Announcements', href: '/admin/announcements', roles: ['admin'] },
    { title: 'Manage Holidays', href: '/admin/holidays', roles: ['admin'] },
  ];

  const availableActions = allActions.filter(action => action.roles.includes(userRole));

  return (
    <div className="lg:hidden mt-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex justify-between items-center text-left"
        >
          <div className="flex items-center gap-3">
            <FiLink className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Quick Links</h2>
          </div>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {isOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              {availableActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="block p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {action.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileQuickLinks;