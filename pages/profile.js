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
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchUserData = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/by-email?email=${session.user.email}`);
      if (!res.ok) throw new Error("Could not fetch user data.");

      const data = await res.json();
      if (data) {
        setUserData(data);
        setFormData(data); // Initialize form data
      } else {
        setMessage("Your data could not be found. Please contact an admin.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated" && !userData) {
      fetchUserData();
    }
  }, [status, userData, fetchUserData]);

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

  if (status === "loading" || (isLoading && !userData)) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg w-full max-w-4xl mx-auto my-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 rounded-full ring-4 ring-blue-500 ring-offset-4 overflow-hidden flex-shrink-0">
              <Image
                src={imagePreview || userData?.profileImage || '/default-avatar.png'}
                alt="Profile Picture"
                fill
                sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 128px"
                priority
                className="object-cover"
              />
              {isEditMode && (
                <label htmlFor="profileImageInput" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                  <FiCamera size={32} />
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
                <input
                  type="text"
                  name="name"
                  value={formData?.name || ''}
                  onChange={handleInputChange}
                  className="text-3xl w-full  font-bold text-gray-800 bg-gray-100 border-2 border-gray-300 rounded-md px-2 py-1"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-800">{userData?.name}</h1>
              )}
              <p className="text-gray-500 capitalize">{userData?.role}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {!isEditMode ? (
              <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

        {message && <p className="text-center text-sm my-4 p-3 bg-blue-100 rounded-lg">{message}</p>}

        {userData ? (
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg mt-8">
            {Object.entries(userData).map(([key, value]) => {
              const editableFields = ['name', 'phone'];
              if (key.startsWith('_') || key === 'customFields' || typeof value === 'object' || ['id', 'profileComplete', 'status', 'role', 'password', 'createdAt', 'updatedAt', '__v', 'profileImage'].includes(key)) return null;

              const label = key.replace(/([A-Z])/g, ' $1');

              if (isEditMode && editableFields.includes(key)) {
                return (
                  <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-500 capitalize">{label}</label>
                    <input
                      type={key === 'phone' ? 'tel' : 'text'}
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
                <div key={key} className="border-b pb-2">
                  <strong className="capitalize text-gray-600">{label}:</strong>
                  <p className="text-gray-800 mt-1">{value || "N/A"}</p>
                </div>
              );
            })}
            {userData.customFields && Object.entries(userData.customFields).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="border-b pb-2">
                  <strong className="capitalize text-gray-600">{key.replace(/_/g, ' ')}:</strong>
                  <p className="text-gray-800 mt-1">{value}</p>
                </div>
              );
            })}
          </form>
        ) : (
          <p>No profile data to display.</p>
        )}
      </div>
    </>
  );
}
 