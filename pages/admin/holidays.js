import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiSave } from 'react-icons/fi';

export default function AdminHolidaysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState(null);
  const [formData, setFormData] = useState({ name: '', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchHolidays();
  }, [session, status, router]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/holidays');
      if (res.ok) {
        const data = await res.json();
        setHolidays(data);
      }
    } catch (error) {
      toast.error('Failed to fetch holidays.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading(currentHoliday ? 'Updating holiday...' : 'Adding holiday...');

    try {
      const method = currentHoliday ? 'PUT' : 'POST';
      const url = '/api/admin/holidays';
      const body = currentHoliday ? { ...formData, _id: currentHoliday._id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message, { id: loadingToast });
      setShowForm(false);
      setCurrentHoliday(null);
      setFormData({ name: '', date: '' });
      fetchHolidays();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (holiday) => {
    setCurrentHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0], // Format for input[type=date]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    const loadingToast = toast.loading('Deleting holiday...');
    try {
      const res = await fetch(`/api/admin/holidays?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message, { id: loadingToast });
      fetchHolidays();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading holidays...</div>;
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FiCalendar /> Manage Holidays
        </h1>

        <button
          onClick={() => { setShowForm(true); setCurrentHoliday(null); setFormData({ name: '', date: '' }); }}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FiPlus className="mr-2" /> Add New Holiday
        </button>

        {showForm && (
          <form onSubmit={handleAddEdit} className="mb-8 p-6 border rounded-lg bg-gray-50 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">{currentHoliday ? 'Edit Holiday' : 'Add New Holiday'}</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Holiday Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-md text-sm font-medium">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
                <FiSave className="mr-2" /> {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holidays.map((holiday) => (
                <tr key={holiday._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(holiday.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{holiday.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                    <button onClick={() => handleEditClick(holiday)} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="Edit"><FiEdit /></button>
                    <button onClick={() => handleDelete(holiday._id)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title="Delete"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}