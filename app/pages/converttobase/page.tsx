"use client";
import Header from "@/app/common/header/Header";
import { useState, ChangeEvent } from "react";

const Base64Converter = () => {
  const [base64String, setBase64String] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image file size should be under 2 MB.");
        setBase64String(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64String(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadBase64AsTxt = () => {
    if (!base64String) return;

    const blob = new Blob([base64String], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image-base64.txt";
    a.click();
    URL.revokeObjectURL(url);

    // Resetting the state after downloading
    setBase64String(null);
    setError(null);
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Image to Base64 Converter
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {base64String && (
          <div className="mb-4">
            <textarea
              className="w-full h-48 p-2 border rounded-lg"
              value={base64String}
              readOnly
            />
          </div>
        )}

        <button
          onClick={downloadBase64AsTxt}
          className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
        >
          Download Base64 as TXT
        </button>
      </div>
    </div>
    </>
  );
};

export default Base64Converter;
