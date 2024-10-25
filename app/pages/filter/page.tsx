"use client"
import Header from "@/app/common/header/Header";
import { useRef, useState, ChangeEvent } from "react";

export default function ImageFilterEditor() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blur, setBlur] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(100);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle image upload with a 2 MB limit
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
      setError(null); // Clear any previous errors
    }
  };

  // Apply filters and render on canvas
  const applyFilters = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply filters and draw image on canvas
        if (ctx) {
          ctx.filter = `blur(${blur}px) contrast(${contrast}%) brightness(${brightness}%)`;
          ctx.drawImage(img, 0, 0, img.width, img.height);
        }
      };
    }
  };

  // Handle download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "image_with_filters.png";
      link.click();

      // Reset state after download
      resetState();
    }
  };

  // Reset state to allow uploading a new image
  const resetState = () => {
    setImageSrc(null);
    setBlur(0);
    setContrast(100);
    setBrightness(100);
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Filter Editor</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {imageSrc && (
          <>
            <img src={imageSrc} alt="Uploaded Preview" className="mb-4 max-w-full rounded shadow-md" />

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Blur</label>
              <input
                type="range"
                min="0"
                max="20"
                value={blur}
                onChange={(e) => setBlur(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Contrast</label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Brightness</label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={applyFilters}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 transition-colors hover:bg-blue-600"
            >
              Apply Filters
            </button>

            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
              disabled={!imageSrc}
            >
              Download Image
            </button>

            <canvas ref={canvasRef} className="w-full mt-4" style={{ display: imageSrc ? "block" : "none" }} />
          </>
        )}
      </div>
    </div>
    </>
  );
}
