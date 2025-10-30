import { useState, useEffect } from 'react';

const WelcomeHeader = ({ userName }) => {
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold">
        {greeting}, {userName}! 👋
      </h1>
      <p className="text-base sm:text-lg text-indigo-100 mt-2">
        Welcome back to your dashboard. Here&apos;s what&apos;s happening at NEXA Datamagics Solutions.
      </p>
    </div>
  );
};

export default WelcomeHeader;
