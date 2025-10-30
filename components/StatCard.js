import { useState, useEffect } from 'react';

const StatCard = ({ icon, label, value, suffix = '', duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    const incrementTime = (duration / end);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center gap-4">
      <div className="text-3xl text-indigo-500">{icon}</div>
      <div>
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="text-2xl font-bold text-gray-800">
          {count}
          {suffix}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
