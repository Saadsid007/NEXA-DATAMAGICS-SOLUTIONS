import { useState } from 'react';
import Link from 'next/link';
import { FaBuilding, FaEnvelope } from 'react-icons/fa';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(data.message);
      setEmail(''); // Clear the email field on success
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-6">
        <FaBuilding className="inline-block text-blue-600 text-4xl mb-2" />
        <h2 className="text-2xl font-bold text-gray-700">NEXA DATAMAGICS SOLUTIONS</h2>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Forgot Password</h1>
        <p className="text-center text-gray-600 mb-6">Enter your email to receive a reset link.</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg text-center mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold text-gray-700">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 border-gray-400 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              required
              autoComplete="email"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="text-center mt-6"><Link href="/login" className="text-blue-600 hover:underline font-semibold">Back to Login</Link></div>
      </div>
    </div>
  );
}