import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Register</h1>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded-lg" required />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Phone Number:</label>
            <input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded-lg" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400">
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
