import { useState, useEffect } from 'react';
import { FiRss } from 'react-icons/fi';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FiRss /> Company Announcements
        </h1>
        {loading ? (
          <p>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p>No announcements at the moment.</p>
        ) : (
          <div className="space-y-6">
            {announcements.map((ann) => (
              <div key={ann._id} className="p-4 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">{ann.title}</h2>
                <p className="text-gray-600 mt-2">{ann.content}</p>
                <p className="text-xs text-gray-400 mt-3 text-right">Posted on: {new Date(ann.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}