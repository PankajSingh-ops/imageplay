"use client"
import Header from "@/app/common/header/Header";
import { useRef, useState, ChangeEvent } from "react";

export default function ImageOverlayDownload() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState<string>("Your Text Here");
  const [textColor, setTextColor] = useState<string>("#FFFFFF"); // Default to white
  const [error, setError] = useState<string | null>(null);
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

  // Draw image with overlay text on canvas
  const drawCanvas = () => {
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

        // Draw image on canvas
        ctx?.drawImage(img, 0, 0);

        // Set text properties and add overlay text
        if (ctx) {
          ctx.font = "40px Arial"; // Adjust font size/style
          ctx.fillStyle = textColor; // Use selected text color
          ctx.textAlign = "center"; // Center the text horizontally
          ctx.fillText(overlayText, canvas.width / 2, canvas.height / 2); // Center text vertically
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
      link.download = "image_with_overlay.png";
      link.click();
    }
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Overlay Editor</h1>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <input
          type="text"
          placeholder="Enter overlay text"
          value={overlayText}
          onChange={(e) => setOverlayText(e.target.value)}
          className="block w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        
        <div className="flex items-center justify-between mb-4">
          <label className="text-gray-700 dark:text-gray-300">Text Color:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="ml-4"
          />
        </div>

        <button
          onClick={drawCanvas}
          className="w-full bg-blue-500 text-white py-2 rounded mb-2 transition-colors hover:bg-blue-600"
        >
          Generate Image with Overlay
        </button>
        
        <button
          onClick={handleDownload}
          className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
          disabled={!imageSrc}
        >
          Download Image
        </button>

        {imageSrc && (
          <canvas
            ref={canvasRef}
            className="w-full mt-4"
            style={{ display: imageSrc ? "block" : "none" }}
          />
        )}
      </div>
    </div>
    </>
  );
}
