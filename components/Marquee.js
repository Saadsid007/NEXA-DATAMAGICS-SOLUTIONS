import { useState, useEffect, useRef, Fragment } from 'react';
import Link from 'next/link';
import { FiBell, FiX } from 'react-icons/fi';

const AnnouncementModal = ({ announcements, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Company Announcements</h3>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
          <FiX className="text-gray-600" />
        </button>
      </div>
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <ul className="space-y-4">
          {announcements.map((ann) => (
            <li key={ann._id} className="border-b pb-3">
              <h4 className="font-semibold text-gray-700">{ann.title}</h4>
              <p className="text-gray-600 text-sm">{ann.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(ann.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default function Marquee() {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const marqueeRef = useRef(null);

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
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <>
      {showModal && <AnnouncementModal announcements={announcements} onClose={() => setShowModal(false)} />}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2.5 shadow-inner flex items-center">
        <button onClick={() => setShowModal(true)} className="px-4 hover:bg-blue-700 rounded-full" title="View Announcements">
          <FiBell />
        </button>
        <marquee
          ref={marqueeRef}
          behavior="scroll"
          direction="left"
          className="text-sm font-medium tracking-wide flex-grow"
          onMouseOver={() => marqueeRef.current?.stop()}
          onMouseOut={() => marqueeRef.current?.start()}
        >
          {announcements.map((ann, index) => (
            <Fragment key={ann._id}>
              <Link href="/announcements" className="mx-4 hover:underline">{ann.title}</Link>
              {index < announcements.length - 1 && (
                <span className="mx-2 select-none">&bull;</span>
              )}
            </Fragment>
          ))}
        </marquee>
        <Link href="/announcements" className="px-4 text-sm font-semibold hover:underline whitespace-nowrap">View All</Link>
      </div>
    </>
  );
};