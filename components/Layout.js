import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      {/* The main content will now have its own scrollbar */}
      <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
    </div>
  );
};

export default Layout;