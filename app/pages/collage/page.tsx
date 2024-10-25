"use client"
import Header from "@/app/common/header/Header";
import { useState, ChangeEvent, useRef } from "react";

export default function ImageCollageMaker() {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<number>(2);
  const [columns, setColumns] = useState<number>(2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle multiple image uploads with a 2 MB limit per file
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.size > 2 * 1024 * 1024) {
          setError("Each file should be under 2 MB");
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            newImages.push(reader.result as string);
            if (newImages.length === files.length) {
              setImages((prev) => [...prev, ...newImages]);
              setError(null);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Generate collage based on row and column count
  const createCollage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const imgWidth = canvas.width / columns;
      const imgHeight = canvas.height / rows;
      
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        images.slice(0, rows * columns).forEach((src, index) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            const x = (index % columns) * imgWidth;
            const y = Math.floor(index / columns) * imgHeight;
            ctx.drawImage(img, x, y, imgWidth, imgHeight);
          };
        });
      }
    }
  };

  // Handle collage download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "image_collage.png";
      link.click();
      resetState();
    }
  };

  // Reset state to allow new collage creation
  const resetState = () => {
    setImages([]);
    setRows(2);
    setColumns(2);
  };

  return (
    <>
    <Header />
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Image Collage Maker</h1>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {images.length > 0 && (
          <>
            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Rows</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Columns</label>
              <input
                type="number"
                value={columns}
                onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            <button
              onClick={createCollage}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 transition-colors hover:bg-blue-600"
            >
              Create Collage
            </button>

            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600"
              disabled={images.length === 0}
            >
              Download Collage
            </button>

            <canvas ref={canvasRef} className="w-full mt-4" width={600} height={600} />
          </>
        )}
      </div>
    </div>
    </>
  );
}
