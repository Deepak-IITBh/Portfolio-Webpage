// src/components/ResumeDownload.tsx
import React from 'react';

const ResumeDownload: React.FC = () => {
  const handleDownload = () => {
    const resumeUrl = 'deepakde-Re.pdf'; // Ensure the resume is in the "public" folder
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'Deepak_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex justify-center items-center my-8">
      <button
        onClick={handleDownload}
        className="px-6 py-3 text-lg font-semibold rounded-2xl shadow-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        Download Resume
      </button>
    </div>
  );
};

export default ResumeDownload;
