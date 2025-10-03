import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Image from 'next/image';

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
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl mx-auto my-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 ring-4 ring-blue-500 ring-offset-4 overflow-hidden flex-shrink-0">
          {userData?.profileImage ? (
            <Image
              src={userData.profileImage}
              alt="Profile Picture"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-300"></div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{userData?.name}</h1>
          <p className="text-gray-500 capitalize">{userData?.role}</p>
        </div>
      </div>

      {message && <p className="text-center text-sm my-4 p-3 bg-blue-100 rounded-lg">{message}</p>}

      {userData? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
          {Object.entries(userData).map(([key, value]) => {
            // Don't display internal or complex fields
            if (key.startsWith('_') || key === 'customFields' || typeof value === 'object' || ['id', 'profileComplete', 'status', 'role', 'password', 'createdAt', 'updatedAt', '__v', 'profileImage'].includes(key)) return null;
            return (
              <div key={key} className="border-b pb-2">
                <strong className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1')}:</strong>
                <p className="text-gray-800">{value || "N/A"}</p>
              </div>
            )
          })}
          {/* Render Custom Fields Separately */}
          {userData.customFields && Object.keys(userData.customFields).length > 0 && (
            Object.entries(userData.customFields).map(([key, value]) => {
              if (!value) return null; // Don't show empty custom fields
              return (
                <div key={key} className="border-b pb-2">
                  {/* Replace underscores with spaces for a cleaner label */}
                  <strong className="capitalize text-gray-600">{key.replace(/_/g, ' ')}:</strong>
                  <p className="text-gray-800">{value}</p>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <p>No profile data to display.</p>
      )}
    </div>
  );
}
 