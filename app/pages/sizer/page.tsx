"use client"
import Header from "@/app/common/header/Header";
import { useRef, useState, ChangeEvent } from "react";

export default function ImageResizer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number | null>(null);
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);
  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(true);
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
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          setImageSrc(reader.result as string);
          setOriginalWidth(img.width);
          setOriginalHeight(img.height);
          setWidth(img.width);
          setHeight(img.height);
        };
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Apply resizing to the image and render on canvas
  const applyResize = () => {
    if (!imageSrc || !width || !height) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);
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
      link.download = "resized_image.png";
      link.click();
      resetState();
    }
  };

  // Maintain aspect ratio on width/height change
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value);
    setWidth(newWidth);
    if (aspectRatioLocked && originalWidth && originalHeight) {
      setHeight(Math.round((newWidth * originalHeight) / originalWidth));
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value);
    setHeight(newHeight);
    if (aspectRatioLocked && originalWidth && originalHeight) {
      setWidth(Math.round((newHeight * originalWidth) / originalHeight));
    }
  };

  // Reset state to allow uploading a new image
  const resetState = () => {
    setImageSrc(null);
    setWidth(null);
    setHeight(null);
    setOriginalWidth(null);
    setOriginalHeight(null);
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Resizer</h1>

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
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Width</label>
              <input
                type="number"
                value={width || ""}
                onChange={handleWidthChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Height</label>
              <input
                type="number"
                value={height || ""}
                onChange={handleHeightChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={aspectRatioLocked}
                onChange={() => setAspectRatioLocked(!aspectRatioLocked)}
                className="mr-2"
              />
              <label className="text-gray-700 dark:text-gray-300">Maintain Aspect Ratio</label>
            </div>

            <button
              onClick={applyResize}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 transition-colors hover:bg-blue-600"
            >
              Apply Resize
            </button>

            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
              disabled={!imageSrc}
            >
              Download Resized Image
            </button>

            <canvas ref={canvasRef} className="w-full mt-4" style={{ display: imageSrc ? "block" : "none" }} />
          </>
        )}
      </div>
    </div>
    </>
  );
}
