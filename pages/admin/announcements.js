import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiRss, FiCheckCircle, FiXCircle, FiSave } from 'react-icons/fi';

export default function AdminAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null); // For editing
  const [formData, setFormData] = useState({ title: '', content: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchAnnouncements();
  }, [session, status, router]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      toast.error('Failed to fetch announcements.');
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading(currentAnnouncement ? 'Updating announcement...' : 'Adding announcement...');

    try {
      const method = currentAnnouncement ? 'PUT' : 'POST';
      const url = '/api/admin/announcements';
      const body = currentAnnouncement ? { ...formData, _id: currentAnnouncement._id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Operation failed.');
      }

      toast.success(result.message, { id: loadingToast });
      setShowForm(false);
      setCurrentAnnouncement(null);
      setFormData({ title: '', content: '', isActive: true });
      fetchAnnouncements(); // Refresh list
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
      console.error('Error adding/editing announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (announcement) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const loadingToast = toast.loading('Deleting announcement...');
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete announcement.');
      }

      toast.success(result.message, { id: loadingToast });
      fetchAnnouncements(); // Refresh list
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
      console.error('Error deleting announcement:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading announcements...</div>;
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FiRss /> Manage Company Announcements
        </h1>

        <button
          onClick={() => { setShowForm(true); setCurrentAnnouncement(null); setFormData({ title: '', content: '', isActive: true }); }}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiPlus className="mr-2" /> Add New Announcement
        </button>

        {showForm && (
          <div className="mb-8 p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{currentAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
            <form onSubmit={handleAddEdit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                <textarea id="content" name="content" rows="4" value={formData.content} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required></textarea>
              </div>
              <div className="flex items-center">
                <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
                  <FiSave className="mr-2" /> {isSubmitting ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{ann.title}</h2>
                <p className="text-gray-600 mt-1 text-sm">{ann.content.substring(0, 100)}{ann.content.length > 100 ? '...' : ''}</p>
                <p className="text-xs text-gray-400 mt-2">Posted: {new Date(ann.createdAt).toLocaleDateString()} | Status: {ann.isActive ? <FiCheckCircle className="inline text-green-500" /> : <FiXCircle className="inline text-red-500" />}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditClick(ann)} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="Edit">
                  <FiEdit />
                </button>
                <button onClick={() => handleDelete(ann._id)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}