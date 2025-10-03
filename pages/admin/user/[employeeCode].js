import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { FiEdit, FiSave, FiX, FiPlusCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { employeeCode } = router.query;

  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const fetchUserData = useCallback(async () => {
    if (!employeeCode) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/by-code?code=${employeeCode}`);
      if (!res.ok) throw new Error("Could not fetch user data.");
      const data = await res.json();
      const combinedData = { ...data, ...(data.customFields || {}) };
      setUserData(data);
      setFormData(combinedData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [employeeCode]);

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role !== 'admin') router.push('/dashboard');
      else fetchUserData();
    }
  }, [status, session, router, fetchUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewField = () => {
    if (!newFieldName.trim()) return toast.error('Field name cannot be empty.');
    const key = newFieldName.trim().replace(/\s+/g, '_');
    setFormData(prev => ({ ...prev, [key]: newFieldValue }));
    setNewFieldName(''); setNewFieldValue(''); setShowAddField(false);
  };

  const handleDeleteField = (key) => {
    const newFormData = { ...formData };
    delete newFormData[key];
    setFormData(newFormData);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating profile...');
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: userData._id }),
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update profile.');

      toast.success('Profile updated successfully!', { id: loadingToast });
      setIsEditMode(false);
      fetchUserData();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const renderField = (key, value) => {
    const predefinedFields = Object.keys(userData).filter(k => k !== 'customFields');
    const isCustomField = !predefinedFields.includes(key);
    const editableFields = ['name', 'phone', 'currentCity', 'process', 'workLocation', 'designation', 'dateOfJoining', 'shiftTiming', 'systemServiceTag', 'employmentType', 'holdingAssets', 'managerAssign'];
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    if (isEditMode && (editableFields.includes(key) || isCustomField)) {
      return (
        <div key={key} className="relative">
          <label className="block text-sm font-medium text-gray-500">{label}</label>
          <input type="text" name={key} value={formData[key] || ''} onChange={handleInputChange} className="mt-1 block w-full pr-8 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          {isCustomField && (
            <button type="button" onClick={() => handleDeleteField(key)} className="absolute top-7 right-2 text-red-400 hover:text-red-600" title={`Delete ${label} field`}><FiXCircle size={18} /></button>
          )}
        </div>
      );
    }

    if (['password', 'role', 'status'].includes(key)) return null;

    return (
      <div key={key} className="border-b border-gray-200 pb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-md text-gray-900">{value || 'N/A'}</p>
      </div>
    );
  };

  if (isLoading || !userData) return <div className="text-center p-10">Loading user profile...</div>;

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <FiArrowLeft /> Back to All Users
        </button>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData.name}&apos;s Profile</h1>
              <p className="mt-1 text-gray-500">Employee Code: {userData.employeeCode}</p>
            </div>
            {!isEditMode ? (
              <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"><FiEdit /> Edit Profile</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleUpdateProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><FiSave /> Save</button>
                <button onClick={() => { setIsEditMode(false); setFormData({ ...userData, ...(userData.customFields || {}) }); setShowAddField(false); }} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"><FiX /> Cancel</button>
              </div>
            )}
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-md">
              {Object.entries(formData).map(([key, value]) => {
                if (['_id', 'createdAt', 'updatedAt', '__v', 'profileComplete', 'customFields'].includes(key)) return null;
                return renderField(key, value);
              })}
            </div>
          </form>

          {isEditMode && (
            <div className="mt-6">
              {!showAddField ? (
                <button onClick={() => setShowAddField(true)} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"><FiPlusCircle /> Add New Field</button>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-md font-semibold mb-2">Add a Custom Field</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Field Name" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                    <input type="text" placeholder="Field Value" value={newFieldValue} onChange={(e) => setNewFieldValue(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={handleAddNewField} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Add</button>
                    <button onClick={() => setShowAddField(false)} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}