import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function ProfileSetup() {
  const { data: session, status, update, getSession } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    designation: "",
    process: "",
    dateOfJoining: "",
    shiftTiming: "1 PM to 10 PM",
    workLocation: "Remote",
    currentCity: "",
    systemServiceTag: "",
    employmentType: "Full-time",
    holdingAssets: "",
    managerAssign: "",
  });
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || !session.user) {
      setMessage("Session not ready. Please wait...");
      return;
    }

    setIsLoading(true);
    setMessage("Saving your profile...");

    try {      
      const res = await fetch("/api/users/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: session.user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setMessage("Profile saved! Finalizing session...");

      // Trigger the session update. This will activate the `jwt` callback's "update" block.
      await update();

      // Now that the session is updated, redirect.
      router.push("/dashboard");
    } catch (error) {
      console.error("Error during profile save:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Welcome! Please fill out your details to get started.
        </h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes("Error") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="process" className="block text-sm font-medium text-gray-700">
              Process
            </label>
            <input
              type="text"
              id="process"
              name="process"
              value={formData.process}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700">
              Date of Joining
            </label>
            <input
              type="date"
              id="dateOfJoining"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="shiftTiming" className="block text-sm font-medium text-gray-700">
              Shift Timing
            </label>
            <select
              id="shiftTiming"
              name="shiftTiming"
              value={formData.shiftTiming}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="9 AM to 6 PM">9 AM to 6 PM</option>
              <option value="1 PM to 10 PM">1 PM to 10 PM</option>
              <option value="6 PM to 3 AM">6 PM to 3 AM</option>
            </select>
          </div>

          <div>
            <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">
              Work Location
            </label>
            <select
              id="workLocation"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Remote">Remote</option>
              <option value="Office">Office</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700">
              Current City
            </label>
            <input
              type="text"
              id="currentCity"
              name="currentCity"
              value={formData.currentCity}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="systemServiceTag" className="block text-sm font-medium text-gray-700">
              System Service Tag
            </label>
            <input
              type="text"
              id="systemServiceTag"
              name="systemServiceTag"
              value={formData.systemServiceTag}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          <div>
            <label htmlFor="holdingAssets" className="block text-sm font-medium text-gray-700">
              Holding Assets
            </label>
            <textarea
              id="holdingAssets"
              name="holdingAssets"
              value={formData.holdingAssets}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="List any company assets you're holding..."
            />
          </div>

          <div>
            <label htmlFor="managerAssign" className="block text-sm font-medium text-gray-700">
              Assign Manager
            </label>
            <select
              id="managerAssign"
              name="managerAssign"
              value={formData.managerAssign}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Select a manager</option>
              {/* NOTE: Replace these with actual manager emails from your DB or config */}
              <option value="manager1@example.com">Manager One (manager1@gmail.com)</option>
              <option value="manager2@example.com">Manager Two (manager2@gmail.com)</option>
              <option value="manager3@example.com">Manager Three (manager3@gmail.com)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {isLoading ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
