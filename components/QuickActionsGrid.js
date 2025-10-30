import { useSession } from 'next-auth/react';
import ActionCard from './ActionCard';
import { FiUser, FiFileText, FiClipboard, FiImage, FiCheckSquare, FiInfo, FiRss, FiCalendar } from 'react-icons/fi';

const QuickActionsGrid = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const allActions = [
    {
      title: 'My Profile',
      description: 'View and manage your profile.',
      icon: <FiUser />,
      href: userRole === 'admin' ? '/admin/profile' : '/profile',
      roles: ['admin', 'manager', 'user'],
    },
    {
      title: 'Apply for Leave',
      description: 'Submit and track your leave requests.',
      icon: <FiFileText />,
      href: '/leave-application',
      roles: ['manager', 'user'],
    },
    {
      title: 'Manage Leaves',
      description: 'Approve or reject leave requests.',
      icon: <FiClipboard />,
      href: userRole === 'admin' ? '/admin/manage-leaves' : '/manager/leave-requests',
      roles: ['admin', 'manager'],
    },
    {
      title: 'My Tasks',
      description: 'View and manage your tasks.',
      icon: <FiCheckSquare />,
      href: '/tasks', // Placeholder link
      roles: ['admin', 'manager', 'user'],
    },
    {
      title: 'Manage Company Info',
      description: 'Update CEO details and company stats.',
      icon: <FiInfo />,
      href: '/admin/company-info',
      roles: ['admin'],
    },
    {
      title: 'Manage Announcements',
      description: 'Add, edit, or delete company announcements.',
      icon: <FiRss />,
      href: '/admin/announcements',
      roles: ['admin'],
    },
    {
      title: 'Manage Holidays',
      description: 'Add or remove company holidays.',
      icon: <FiCalendar />,
      href: '/admin/holidays',
      roles: ['admin'],
    },
  ];

  const availableActions = allActions.filter(action => action.roles.includes(userRole));

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {availableActions.map((action) => (
          <ActionCard
            key={action.title}
            href={action.href}
            icon={action.icon}
            title={action.title}
            description={action.description}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
