import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function PendingRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users/pending');
      if (!res.ok) {
        throw new Error('Failed to fetch pending users.');
      }
      const data = await res.json();
      setPendingUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchPendingUsers();
      }
    }
  }, [status, session, router]);

  const handleUpdateStatus = async (userId, newStatus) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/users/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(`User has been ${newStatus}.`);
      // Refresh the list of pending users
      fetchPendingUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="p-4">Loading pending requests...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pending User Requests</h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
      {message && <p className="text-green-500 bg-green-100 p-3 rounded-md mb-4">{message}</p>}

      {pendingUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.phone}</td>
                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(user._id, 'approved')}
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(user._id, 'rejected')}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No pending requests at the moment.</p>
      )}
    </div>
  );
}
