import { createContext, useState, useContext, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const PendingCountContext = createContext();

export const usePendingCounts = () => useContext(PendingCountContext);

export const PendingCountProvider = ({ children }) => {
  const [counts, setCounts] = useState({ users: 0, leaves: 0, resignations: 0 });
  const { data: session } = useSession();

  const fetchCounts = useCallback(async () => {
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      setCounts({ users: 0, leaves: 0, resignations: 0 });
      return;
    }

    try {
      const res = await fetch('/api/counts/pending');
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      } else {
        console.error('Failed to fetch pending counts');
        setCounts({ users: 0, leaves: 0, resignations: 0 });
      }
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  }, [session]);

  return (
    <PendingCountContext.Provider value={{ counts, fetchCounts }}>
      {children}
    </PendingCountContext.Provider>
  );
};
