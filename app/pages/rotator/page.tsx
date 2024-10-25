"use client"
import { useRef, useState, ChangeEvent } from "react";

export default function ImageRotator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
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

  // Apply rotation and render on canvas
  const applyRotation = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        const angleInRadians = (rotation * Math.PI) / 180;

        // Set canvas size to account for rotated dimensions
        const rotatedWidth = Math.abs(img.width * Math.cos(angleInRadians)) + Math.abs(img.height * Math.sin(angleInRadians));
        const rotatedHeight = Math.abs(img.width * Math.sin(angleInRadians)) + Math.abs(img.height * Math.cos(angleInRadians));
        canvas.width = rotatedWidth;
        canvas.height = rotatedHeight;

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
          ctx.rotate(angleInRadians);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.rotate(-angleInRadians); // Reset rotation
          ctx.translate(-rotatedWidth / 2, -rotatedHeight / 2);
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
      link.download = "rotated_image.png";
      link.click();

      // Reset state after download
      resetState();
    }
  };

  // Reset state to allow uploading a new image
  const resetState = () => {
    setImageSrc(null);
    setRotation(0);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Rotator</h1>

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
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Rotation (Degrees)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">Current: {rotation}°</p>
            </div>

            <button
              onClick={applyRotation}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 transition-colors hover:bg-blue-600"
            >
              Apply Rotation
            </button>

            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
              disabled={!imageSrc}
            >
              Download Rotated Image
            </button>

            <canvas ref={canvasRef} className="w-full mt-4" style={{ display: imageSrc ? "block" : "none" }} />
          </>
        )}
      </div>
    </div>
  );
}
