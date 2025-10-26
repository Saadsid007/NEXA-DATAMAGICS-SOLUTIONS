import { useState } from "react";
import { FiX, FiExternalLink, FiCopy } from "react-icons/fi";

const AttachmentModal = ({ attachmentUrl, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!attachmentUrl) return null;

  let viewerUrl = attachmentUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(attachmentUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Attachment Viewer</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <FiCopy />
              <span>{isCopied ? "Copied!" : "Copy URL"}</span>
            </button>
            <a
              href={viewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiExternalLink />
              <span>Preview in New Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <FiX className="text-gray-600" size={24} />
            </button>
          </div>
        </div>
        <div className="p-8 flex-grow overflow-auto flex flex-col items-center justify-center text-center bg-gray-50">
            <p className="text-lg text-gray-600 mb-4">Click the button above to open the attachment in a new tab.</p>
            <p className="text-sm text-gray-500">From the new tab, you can view, print, or download the file.</p>
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;
