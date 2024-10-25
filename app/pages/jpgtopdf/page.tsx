
"use client";
import { useState, ChangeEvent } from "react";
import jsPDF from "jspdf";
import Header from "@/app/common/header/Header";

export default function JpgToPdfConverter() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size should be under 2 MB");
        setImageSrc(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;

    const pdf = new jsPDF();
    pdf.addImage(imageSrc, 'JPEG', 0, 0, 210, 297); // A4 size in mm
    pdf.save("converted_image.pdf");
    
    // Reset state after download
    resetState();
  };

  const resetState = () => {
    setImageSrc(null);
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">JPG to PDF Converter</h1>

        <input
          type="file"
          accept="image/jpeg"
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {imageSrc && (
          <>
            <img src={imageSrc} alt="Uploaded Preview" className="mb-4 max-w-full rounded shadow-md" />
            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
            >
              Download as PDF
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
}
