"use client";
import { useRef, useState, ChangeEvent } from "react";

export default function ImageGrayscaleInvert() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size should be under 2 MB");
        setImageSrc(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyGrayscaleInvert = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.filter = `grayscale(${grayscale}%) invert(${invert}%)`;
          ctx.drawImage(img, 0, 0, img.width, img.height);
        }
      };
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "edited-image.png";
      link.click();
    }
  };

  // Automatically apply filters when an image is uploaded
  if (imageSrc) applyGrayscaleInvert();

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Grayscale and Invert</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {imageSrc && (
          <>
            <canvas ref={canvasRef} className="w-full mb-4" />

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Grayscale</label>
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={(e) => {
                  setGrayscale(parseInt(e.target.value));
                  applyGrayscaleInvert();
                }}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Invert</label>
              <input
                type="range"
                min="0"
                max="100"
                value={invert}
                onChange={(e) => {
                  setInvert(parseInt(e.target.value));
                  applyGrayscaleInvert();
                }}
                className="w-full"
              />
            </div>

            <button
              onClick={downloadImage}
              className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
            >
              Download Image
            </button>
          </>
        )}
      </div>
    </div>
  );
}
