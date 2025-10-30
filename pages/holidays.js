import { useState, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';

export default function HolidaysPage() {
  const currentYear = new Date().getFullYear();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch('/api/holidays');
        if (res.ok) {
          const data = await res.json();
          // Filter for the current year
          const currentYearHolidays = data.filter(h => new Date(h.date).getFullYear() === currentYear);
          setHolidays(currentYearHolidays);
        }
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [currentYear]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FiCalendar /> Holiday List for {currentYear}
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holiday Name
                </th>
              </tr>
            </thead>
            {loading ? (
              <tbody><tr><td colSpan="3" className="text-center p-4">Loading holidays...</td></tr></tbody>
            ) : (
              <tbody className="bg-white divide-y divide-gray-200">
                {holidays.map((holiday) => (
                  <tr key={holiday._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(holiday.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {holiday.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
