import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { FiSave, FiX, FiCamera, FiInfo, FiEdit } from "react-icons/fi";

export default function AdminCompanyInfoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [formData, setFormData] = useState({
    ceoName: "",
    ceoTitle: "",
    ceoDescriptionP1: "",
    ceoDescriptionP2: "",
  });
  const [ceoImageFile, setCeoImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const fetchCompanyInfo = async () => {
      try {
        const res = await fetch("/api/admin/company-info");
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data);
          setFormData({
            ceoName: data.ceoName || "",
            ceoTitle: data.ceoTitle || "",
            ceoDescriptionP1: data.ceoDescriptionP1 || "",
            ceoDescriptionP2: data.ceoDescriptionP2 || "",
          });
          setImagePreview(data.ceoImageUrl || "/ceo-placeholder.png");
        }
      } catch (error) {
        toast.error("Failed to fetch company info.");
        console.error("Error fetching company info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyInfo();
  }, [session, status, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCeoImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating company info...");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (ceoImageFile) {
      data.append("ceoImage", ceoImageFile);
    }

    try {
      const res = await fetch("/api/admin/company-info", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to update company info.");
      }

      toast.success("Company info updated successfully!", { id: loadingToast });
      setCeoImageFile(null); // Clear file input
      setIsEditMode(false);
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
      console.error("Error updating company info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original state
    // This check prevents errors if companyInfo is null
    if (companyInfo) {
      setFormData({
        ceoName: companyInfo.ceoName || "",
        ceoTitle: companyInfo.ceoTitle || "",
        ceoDescriptionP1: companyInfo.ceoDescriptionP1 || "",
        ceoDescriptionP2: companyInfo.ceoDescriptionP2 || "",
      });
      setImagePreview(companyInfo.ceoImageUrl || "/ceo-placeholder.png");
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading company info...</div>;
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FiInfo /> Manage Company Information
        </h1>
        <div className="flex justify-end mb-4">
          {!isEditMode ? (
            <button
              type="button" // Explicitly set type to button to prevent form submission
              onClick={() => setIsEditMode(true)} 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiEdit className="mr-2" /> Edit Info
            </button>
          ) : (
            <button onClick={handleCancelEdit} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                <FiX className="mr-2" /> Cancel
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative h-48 w-48">
              {/* Container for the circular image */}
              <div className="relative h-full w-full rounded-full overflow-hidden shadow-2xl border-4 border-indigo-200">
                <Image
                  src={imagePreview || '/ceo-placeholder.png'}
                  alt="CEO"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Camera icon is now outside the overflow-hidden container */}
              {isEditMode && (
                <label
                  htmlFor="ceoImageInput"
                  className="absolute bottom-1 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors z-10"
                >
                  <FiCamera className="text-indigo-600 h-5 w-5" />
                  <input
                    id="ceoImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="ceoName"
              className="block text-sm font-medium text-gray-700"
            >
              CEO Name
            </label>
            <input
              type="text"
              id="ceoName"
              name="ceoName"
              value={formData.ceoName}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${!isEditMode ? 'bg-gray-100' : ''}`}
              disabled={!isEditMode}
              required
            />
          </div>
          <div>
            <label
              htmlFor="ceoTitle"
              className="block text-sm font-medium text-gray-700"
            >
              CEO Title
            </label>
            <input
              type="text"
              id="ceoTitle"
              name="ceoTitle"
              value={formData.ceoTitle}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${!isEditMode ? 'bg-gray-100' : ''}`}
              disabled={!isEditMode}
              required
            />
          </div>
          <div>
            <label
              htmlFor="ceoDescriptionP1"
              className="block text-sm font-medium text-gray-700"
            >
              Description Paragraph 1
            </label>
            <textarea
              id="ceoDescriptionP1"
              name="ceoDescriptionP1"
              rows="4"
              value={formData.ceoDescriptionP1}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${!isEditMode ? 'bg-gray-100' : ''}`}
              disabled={!isEditMode}
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="ceoDescriptionP2"
              className="block text-sm font-medium text-gray-700"
            >
              Description Paragraph 2
            </label>
            <textarea
              id="ceoDescriptionP2"
              name="ceoDescriptionP2"
              rows="4"
              value={formData.ceoDescriptionP2}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${!isEditMode ? 'bg-gray-100' : ''}`}
              disabled={!isEditMode}
            ></textarea>
          </div>

          {isEditMode && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
