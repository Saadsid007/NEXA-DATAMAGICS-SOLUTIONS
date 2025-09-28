import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      // Fetch only the current user's data from MongoDB for security and efficiency
      const res = await fetch(`/api/users/by-email?email=${session.user.email}`);
      if (!res.ok) throw new Error("Could not fetch user data.");

      const data = await res.json();
      if (data) {
        setUserData(data);
      } else {
        setMessage("Your data could not be found. Please contact an admin.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]); // useCallback depends on session

  useEffect(() => {
    // Middleware handles unauthenticated redirects.
    if (status === "authenticated" && !userData) {
      fetchUserData();
    }
  }, [status, userData, fetchUserData]); // Added fetchUserData and userData to dependency array

  if (status === "loading" || (isLoading && !userData)) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      {message && <p className="text-center text-sm my-4 p-3 bg-blue-100 rounded-lg">{message}</p>}

      {userData? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
          {Object.entries(userData).map(([key, value]) => {
            // Don't display internal fields
            if (key.startsWith('_') || ['id', 'profileComplete', 'status', 'role', 'password', 'createdAt', 'updatedAt', '__v'].includes(key)) return null;
            return (
              <div key={key} className="border-b pb-2">
                <strong className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1')}:</strong>
                <p className="text-gray-800">{value || "N/A"}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <p>No profile data to display.</p>
      )}
    </div>
  );
}
 