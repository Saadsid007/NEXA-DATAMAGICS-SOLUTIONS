import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaBuilding, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setMessage("Registration successful! Your application is pending admin approval. You will be redirected to login page.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);

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
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Account</h1>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-semibold text-gray-700">Full Name</label>
            <input id="name" name="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-100 border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" required autoComplete="name" />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold text-gray-700">Email Address</label>
            <input id="email" name="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-100 border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" required autoComplete="email" />
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
                className="w-full bg-gray-100 border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                required
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block mb-1 font-semibold text-gray-700">Phone Number</label>
            <input id="phone" name="phone" type="tel" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-100 border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition" required autoComplete="tel" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
