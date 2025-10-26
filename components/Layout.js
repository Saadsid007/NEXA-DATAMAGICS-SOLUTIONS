import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';

const Layout = ({ children }) => {
  // Set initial state to false. It will be updated on the client side.
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  // On component mount, read the pinned state from localStorage.
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarPinned');
    if (savedState !== null) {
      setIsSidebarPinned(JSON.parse(savedState));
    }
  }, []);

  // Whenever the pinned state changes, save it to localStorage.
  useEffect(() => {
    localStorage.setItem('sidebarPinned', JSON.stringify(isSidebarPinned));
  }, [isSidebarPinned]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isPinned={isSidebarPinned} setIsPinned={setIsSidebarPinned} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarPinned(!isSidebarPinned)} />
        {/* The main content will now have its own scrollbar */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;