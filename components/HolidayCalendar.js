import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

const HolidayCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [holidaysMap, setHolidaysMap] = useState({});

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch('/api/holidays');
        if (res.ok) {
          const data = await res.json();
          const map = data.reduce((acc, holiday) => {
            // holiday.date is an ISO string, we need YYYY-MM-DD part
            const formattedDate = holiday.date.split('T')[0];
            acc[formattedDate] = holiday.name;
            return acc;
          }, {});
          setHolidaysMap(map);
        }
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
      }
    };
    fetchHolidays();
  }, []);

  const month = date.getMonth();
  const year = date.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const changeMonth = (delta) => {
    setDate(new Date(year, month + delta, 1));
  };

  const renderDays = () => {
    const dayElements = [];
    // Blanks for the first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayElements.push(<div key={`blank-${i}`} className="text-center p-1"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isHoliday = holidaysMap[fullDate];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      const holidayName = isHoliday ? `${holidaysMap[fullDate]} — ${new Date(fullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : '';

      dayElements.push(
        <div
          key={day}
          title={isHoliday ? holidayName : ''}
          className={`text-center p-2 rounded-full cursor-default transition-colors ${
            isHoliday ? 'bg-red-100 text-red-600 font-bold hover:bg-red-200' : ''
          } ${isToday ? 'bg-indigo-500 text-white' : ''}`}
        >
          {day}
        </div>
      );
    }
    return dayElements;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FiCalendar /> Upcoming Holidays
      </h2>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <FiChevronLeft />
        </button>
        <div className="font-bold text-base sm:text-lg text-gray-700">
          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
          <FiChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-gray-500 text-xs sm:text-sm mb-2">
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
      <div className="text-center mt-6">
        <Link href="/holidays" className="text-indigo-600 font-semibold hover:underline">
            View Full Calendar
        </Link>
      </div>
    </div>
  );
};

export default HolidayCalendar;
