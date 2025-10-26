import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiFileText, FiCheckSquare, FiClipboard } from 'react-icons/fi';

const ResignationLayout = ({ children }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const isManager = session?.user?.role === 'manager';

  let tabs = [];

  if (!isAdmin) {
    tabs.push({ name: 'Apply for Resignation', href: '/resignation/apply', icon: FiFileText });
    tabs.push({ name: 'My Resignation Status', href: '/resignation/status', icon: FiCheckSquare });
  }

  if (isAdmin || isManager) {
    tabs.push({ name: 'Manage Requests', href: '/resignation/manage', icon: FiClipboard });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Resignation Portal</h1>
          <p className="mt-1 text-gray-500">Manage your resignation process here.</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link 
                key={tab.name} 
                href={tab.href}
                className={`${
                    router.pathname === tab.href
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                <span>{tab.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default ResignationLayout;
