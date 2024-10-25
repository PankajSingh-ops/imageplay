"use client";
import Header from "@/app/common/header/Header";
import { useRef, useState, ChangeEvent } from "react";
import Tesseract from "tesseract.js";

export default function ImageEditorWithTextExtraction() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtractingText, setIsExtractingText] = useState<boolean>(false);
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
        setExtractedText(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayImage = () => {
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
          ctx.drawImage(img, 0, 0, img.width, img.height);
        }
      };
    }
  };

  const extractText = () => {
    if (!imageSrc) return;
    setIsExtractingText(true);
    Tesseract.recognize(imageSrc, "eng")
      .then(({ data: { text } }) => {
        setExtractedText(text);
        setIsExtractingText(false);
      })
      .catch(() => {
        setExtractedText("Text extraction failed.");
        setIsExtractingText(false);
      });
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

  // Automatically display the image when it’s uploaded
  if (imageSrc) displayImage();

  return (
    <>
    <Header/>
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Image Editor with Text Extraction</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-6 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {imageSrc && (
          <>
            <canvas ref={canvasRef} className="w-full mb-6" />

            <button
              onClick={downloadImage}
              className="w-full bg-green-500 text-white py-2 rounded mb-4 transition-colors hover:bg-green-600"
            >
              Download Edited Image
            </button>

            <button
              onClick={extractText}
              disabled={isExtractingText}
              className="w-full bg-blue-500 text-white py-2 rounded transition-colors hover:bg-blue-600"
            >
              {isExtractingText ? "Extracting Text..." : "Extract Text from Image"}
            </button>

            {extractedText && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">
                <h3 className="text-lg font-medium mb-2">Extracted Text:</h3>
                <p>{extractedText}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
