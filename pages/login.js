import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaBuilding, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Let next-auth handle the redirection. It will redirect to the
    // page the user was trying to access, or to the root ('/').
    // The middleware will then correctly route them to their dashboard.
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // We handle redirect manually after checking error
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else if (res?.ok) {
      // On successful login, next-auth session is set.
      // The middleware will handle the redirection.
      router.push('/dashboard'); // Or let middleware handle it by pushing to a generic protected route
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-6">
        <FaBuilding className="inline-block text-blue-600 text-4xl mb-2" />
        <h2 className="text-2xl font-bold text-gray-700">NEXA DATAMAGICS SOLUTIONS</h2>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Sign In</h1>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="relative">
            <label htmlFor="password" className="block mb-1 font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 border-gray-400 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form> 
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}