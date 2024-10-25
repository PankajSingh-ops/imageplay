"use client";
import { useRef, useState, ChangeEvent } from "react";

export default function ImageCompressor() {
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [compression, setCompression] = useState<number>(100);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle image upload with a 5 MB limit per file
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter((file) => file.size <= 5 * 1024 * 1024);

      if (validFiles.length !== files.length) {
        setError("Some files exceed the 5 MB limit and were not uploaded.");
      }

      setImages(validFiles);
      setError(null);
    }
  };

  // Apply compression and render on canvas
  const applyCompression = () => {
    if (images.length === 0) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      images.forEach((image) => {
        const img = new Image();
        img.src = URL.createObjectURL(image);

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, img.width, img.height);
          }
        };
      });
    }
  };

  // Handle download of compressed images
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      images.forEach((image, index) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg", compression / 100);
        link.download = `compressed_image_${index + 1}.jpg`;
        link.click();
      });

      resetState();
    }
  };

  // Reset state to allow uploading new images
  const resetState = () => {
    setImages([]);
    setCompression(100);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Compressor</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {images.length > 0 && (
          <>
            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Compression (%)</label>
              <input
                type="range"
                min="10"
                max="100"
                value={compression}
                onChange={(e) => setCompression(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={applyCompression}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 transition-colors hover:bg-blue-600"
            >
              Apply Compression
            </button>

            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
              disabled={images.length === 0}
            >
              Download Compressed Images
            </button>

            <canvas ref={canvasRef} className="w-full mt-4" style={{ display: images.length ? "block" : "none" }} />
          </>
        )}
      </div>
    </div>
  );
}
