import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaBuilding, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (router.isReady && !token) {
      setError('Invalid or missing reset token. Please request a new link.');
    }
  }, [router.isReady, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Reset token is missing.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setMessage(data.message);
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
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Set New Password</h1>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg text-center mb-4">{message}</p>}

        { !message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="password" className="block mb-1 font-semibold text-gray-700">New Password</label>
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-100 border-gray-400 p-3 rounded-lg" required autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-9 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-gray-700">Confirm New Password</label>
              <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-100 border-gray-400 p-3 rounded-lg" required autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-9 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" disabled={isLoading || !token} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        <div className="text-center mt-6"><Link href="/login" className="text-blue-600 hover:underline font-semibold">Back to Login</Link></div>
      </div>
    </div>
  );
}