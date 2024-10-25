"use client"
import { useRef, useState, ChangeEvent } from "react";

export default function ImageColorAdjustments() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hue, setHue] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(100);
  const [sepia, setSepia] = useState<number>(0);
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
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const applyColorAdjustments = () => {
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
          ctx.filter = `hue-rotate(${hue}deg) saturate(${saturation}%) sepia(${sepia}%)`;
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
      link.download = "adjusted-image.png";
      link.click();
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Color Adjustments</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {imageSrc && (
          <>
            <canvas ref={canvasRef} className="w-full mb-4" style={{ display: imageSrc ? "block" : "none" }} />

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Hue</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Saturation</label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Sepia</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sepia}
                onChange={(e) => setSepia(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={applyColorAdjustments}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 transition-colors hover:bg-blue-600"
            >
              Apply Color Adjustments
            </button>

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
