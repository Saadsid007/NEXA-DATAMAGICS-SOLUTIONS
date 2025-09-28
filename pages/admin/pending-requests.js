import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FiUserCheck, FiUserX, FiShield } from "react-icons/fi";

const PendingRequestsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const fetchPendingUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/pending-users");
        if (!res.ok) {
          throw new Error("Failed to fetch pending users");
        }
        const data = await res.json();
        setPendingUsers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [session, status, router]);

  const handleRequest = async (userId, action) => {
    try {
      const res = await fetch("/api/admin/handle-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${action} user`);
      }

      // Update UI by removing the user from the list
      setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Error handling request:", err);
      alert(`Error: ${err.message}`);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pending Approval Requests</h1>

          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

          {pendingUsers.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-lg shadow-md">
              <p className="text-gray-500 text-lg">No pending requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user._id} className="bg-white p-5 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-lg text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registered on: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRequest(user._id, "approveAsUser")}
                      className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-green-600 transition-colors"
                    >
                      <FiUserCheck /> Approve as User
                    </button>
                    <button
                      onClick={() => handleRequest(user._id, "approveAsManager")}
                      className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors"
                    >
                      <FiShield /> Approve as Manager
                    </button>
                    <button
                      onClick={() => handleRequest(user._id, "reject")}
                      className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      <FiUserX /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PendingRequestsPage;