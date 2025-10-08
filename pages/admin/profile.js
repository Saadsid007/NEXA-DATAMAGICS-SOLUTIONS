import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { FiEdit, FiSave, FiX, FiTrash2, FiPlusCircle, FiXCircle, FiCamera } from 'react-icons/fi';

export default function AdminProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const fetchUserData = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/by-email?email=${session.user.email}`);
      if (!res.ok) throw new Error("Could not fetch your data.");
      const data = await res.json();
      // Combine base user data with custom fields for unified form state
      const combinedData = { ...data, ...(data.customFields || {}) };
      setUserData(data);
      setFormData(combinedData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUserData();
      }
    }
  }, [status, session, router, fetchUserData]);

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

  const handleAddNewField = () => {
    if (!newFieldName.trim()) {
      toast.error('Field name cannot be empty.');
      return;
    }
    const key = newFieldName.trim().replace(/\s+/g, '_'); // Sanitize key
    setFormData(prev => ({ ...prev, [key]: newFieldValue }));
    setNewFieldName('');
    setNewFieldValue('');
    setShowAddField(false);
  };

  const handleDeleteField = (key) => {
    const newFormData = { ...formData };
    delete newFormData[key];
    setFormData(newFormData);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating profile...');

    const body = new FormData();
    // Append all form fields (standard and custom)
    for (const key in formData) {
      if (key !== 'customFields' && key !== '_id' && !key.startsWith('__')) {
        body.append(key, formData[key]);
      }
    }
    // Append the new image if one was selected
    if (newProfileImage) {
      body.append('profileImage', newProfileImage);
    }

    try {
      const res = await fetch('/api/admin/update-profile', {
        method: 'POST',
        body: body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }
      const resultData = await res.json();
      await update({ profileImage: resultData.newImageUrl }); // This updates the session with the new image
      toast.success('Profile updated successfully!', { id: loadingToast });
      setIsEditMode(false);
      fetchUserData(); // Re-fetch to show updated data
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleting(true);
      const loadingToast = toast.loading('Deleting your account...');
      try {
        const res = await fetch('/api/admin/delete-profile', {
          method: 'DELETE',
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to delete account.');
        }

        toast.success('Account deleted successfully. You will be logged out.', { id: loadingToast });
        setTimeout(() => signOut({ callbackUrl: '/login' }), 2000);
      } catch (error) {
        toast.error(error.message, { id: loadingToast });
        setIsDeleting(false);
      }
    }
  };

  const renderField = (key, value) => {
    const predefinedFields = Object.keys(userData).filter(k => k !== 'customFields');
    const isCustomField = !predefinedFields.includes(key);
    const editableFields = ['name', 'phone', 'currentCity', 'process', 'workLocation'];
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    if (isEditMode && (editableFields.includes(key) || isCustomField)) {
      return (
        <div key={key} className="relative">
          <label className="block text-sm font-medium text-gray-500">{label}</label>
          <input
            type="text"
            name={key}
            value={formData[key] || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full pr-8 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {isCustomField && (
            <button 
              type="button"
              onClick={() => handleDeleteField(key)} 
              className="absolute top-7 right-2 text-red-400 hover:text-red-600"
              title={`Delete ${label} field`}
            >
              <FiXCircle size={18} />
            </button>
          )}
        </div>
      );
    }

    // Don't render password
    if (key === 'password') return null;

    return (
      <div key={key} className="border-b border-gray-200 pb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-md text-gray-900">{value || 'N/A'}</p>
      </div>
    );
  };

  if (isLoading || !userData) {
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
                <h1 className="text-3xl font-bold text-gray-900">My Admin Profile</h1>
                <p className="mt-1 text-gray-500">View and manage your personal information.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
            {!isEditMode ?(
              <button onClick={() => setIsEditMode(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto">
                <FiEdit /> Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleUpdateProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <FiSave /> Save
                </button>
                <button onClick={() => { setIsEditMode(false); setFormData({ ...userData, ...(userData.customFields || {}) }); setShowAddField(false); setNewProfileImage(null); setImagePreview(null); }} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  <FiX /> Cancel
                </button>
              </>
            )}
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-md">
              {Object.entries(formData).map(([key, value]) => {
                if (['_id', 'createdAt', 'updatedAt', '__v', 'profileComplete', 'profileImage', 'role', 'status', 'customFields'].includes(key)) return null;
                return renderField(key, value);
              })}
            </div>
          </form>

          {isEditMode && (
            <div className="mt-6">
              {!showAddField ? (
                <button onClick={() => setShowAddField(true)} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
                  <FiPlusCircle /> Add New Field
                </button>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-md font-semibold mb-2">Add a Custom Field</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Field Name (e.g., Aadhar Number)"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Field Value"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={handleAddNewField} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Add</button>
                    <button onClick={() => setShowAddField(false)} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-red-200">
            <h2 className="text-xl font-semibold text-red-800">Danger Zone</h2>
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-grow">
                <p className="font-medium text-red-700">Delete this account</p>
                <p className="text-sm text-red-600">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
              >
                <FiTrash2 /> {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}