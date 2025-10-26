import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { FiEdit, FiSave, FiX, FiCamera } from 'react-icons/fi';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [remainingLeaves, setRemainingLeaves] = useState(null);

  const fetchUserData = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/by-email?email=${session.user.email}`);
      if (!res.ok) throw new Error("Could not fetch your data.");

      const data = await res.json();
      if (data) {
        setUserData(data);
        setFormData(data); // Initialize form data
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const fetchLeaveStats = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/leaves/user-stats');
      if (res.ok) {
        const data = await res.json();
        setRemainingLeaves(data.remainingLeaves);
      }
    } catch (error) {
      console.error("Failed to fetch leave stats:", error);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated" && !userData) {
      fetchUserData();
      fetchLeaveStats();
    }
  }, [status, userData, fetchUserData, fetchLeaveStats]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setNewProfileImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating profile...');

    const body = new FormData();
    // Only append fields that are allowed to be edited by the user
    body.append('name', formData.name);
    body.append('phone', formData.phone);

    if (newProfileImage) {
      body.append('profileImage', newProfileImage);
    }

    try {
      const res = await fetch('/api/users/update-profile', {
        method: 'POST',
        body: body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const resultData = await res.json();

      // Update session with new name and image URL
      await update({ name: resultData.newName, profileImage: resultData.newImageUrl });

      toast.success('Profile updated successfully!', { id: loadingToast });
      setIsEditMode(false);
      setNewProfileImage(null);
      setImagePreview(null);
      fetchUserData(); // Re-fetch to show updated data
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData(userData); // Reset form data to original
    setNewProfileImage(null);
    setImagePreview(null);
  };

  if (status === "loading" || isLoading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="relative h-24 w-24 rounded-full overflow-hidden shadow-md ring-2 ring-indigo-200">
              <Image
                src={imagePreview || userData?.profileImage || '/default-avatar.png'}
                alt="Profile Picture"
                fill
                sizes="(max-width: 768px) 10vw, 96px"
                priority
                className="object-cover"
              />
              </div>
              {isEditMode && (
                <label htmlFor="profileImageInput" className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                  <FiCamera className="text-indigo-600" />
                  <input
                    id="profileImageInput"
                    type="file"
                    name="profileImage"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              {isEditMode ? (
                <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              )}
              <p className="mt-1 text-gray-500">View and manage your personal information.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {!isEditMode ? (
              <button onClick={() => setIsEditMode(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto">
                <FiEdit /> Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleUpdateProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <FiSave /> Save
                </button>
                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  <FiX /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {userData ? (
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-md mt-8">
            {Object.entries(userData).map(([key, value]) => {
              const editableFields = ['name', 'phone', 'currentCity'];
              if (['_id', 'createdAt', 'updatedAt', '__v', 'profileComplete', 'profileImage', 'role', 'status', 'customFields'].includes(key)) return null;

              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

              if (isEditMode && editableFields.includes(key)) {
                return (
                  <div key={key} className="border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <input
                      type="text"
                      id={key}
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                );
              }

              return (
                <div key={key} className="border-b border-gray-200 pb-3">
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-md text-gray-900">{value || 'N/A'}</p>
                </div>
              );
            })}
            {remainingLeaves !== null && (
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm font-medium text-gray-500">Remaining Leaves (This Month)</p>
                <p className={`mt-1 text-md font-bold ${remainingLeaves < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {remainingLeaves}
                </p>
              </div>
            )}
            {userData.customFields && Object.entries(userData.customFields).map(([key, value]) => {
              if (!value) return null;
              const label = key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key} className="border-b border-gray-200 pb-3">
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-md text-gray-900">{value}</p>
                </div>
              );
            })}
          </form>
        ) : (
          <p>No profile data to display.</p>
        )}
        </div>
      </div>
    </>
  );
}
 