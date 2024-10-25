"use client"
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import {
  Slider,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Settings,
  Download,
  Delete,
  GridView,
  Dashboard,
  Add,
} from "@mui/icons-material";
import Header from "@/app/common/header/Header";

interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export default function ImageCollageMaker() {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState<"grid" | "free">("grid");
  const [gridSize, setGridSize] = useState({ rows: 2, cols: 2 });
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsLoading(true);
    const promises: Promise<ImageElement>[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setError("Each file should be under 2 MB");
        return;
      }

      promises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const newImage: ImageElement = {
              id: Math.random().toString(36).substr(2, 9),
              src: reader.result as string,
              x: 0,
              y: 0,
              width: canvasSize.width / gridSize.cols,
              height: canvasSize.height / gridSize.rows,
              rotation: 0,
              opacity: 1,
              zIndex: images.length,
            };
            resolve(newImage);
          };
          reader.readAsDataURL(file);
        })
      );
    });

    const newImages = await Promise.all(promises);
    setImages((prev) => [...prev, ...newImages]);
    setError(null);
    setIsLoading(false);
  };


  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images based on layout
    images.sort((a, b) => a.zIndex - b.zIndex).forEach((img) => {
      const image = new Image();
      image.src = img.src;
      
      ctx.save();
      ctx.globalAlpha = img.opacity;
      ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
      ctx.rotate((img.rotation * Math.PI) / 180);
      
      ctx.drawImage(
        image,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      if (borderWidth > 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(
          -img.width / 2,
          -img.height / 2,
          img.width,
          img.height
        );
      }

      ctx.restore();
    });
  };

  const arrangeImagesInGrid = () => {
    const cellWidth = canvasSize.width / gridSize.cols;
    const cellHeight = canvasSize.height / gridSize.rows;

    setImages((prev) =>
      prev.map((img, index) => ({
        ...img,
        x: (index % gridSize.cols) * cellWidth,
        y: Math.floor(index / gridSize.cols) * cellHeight,
        width: cellWidth,
        height: cellHeight,
        rotation: 0,
      }))
    );
  };

  useEffect(() => {
    if (layout === "grid") {
      arrangeImagesInGrid();
    }
  }, [layout, gridSize]);

  useEffect(() => {
    renderCanvas();
  }, [images, borderWidth, borderColor, backgroundColor, layout]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "collage.png";
      link.click();
    }
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Canvas Section */}
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="w-full border border-gray-300 rounded-lg bg-white"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                <CircularProgress />
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="w-full md:w-72 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Controls</h2>
                <IconButton onClick={() => setShowSettings(!showSettings)}>
                  <Settings />
                </IconButton>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Add />}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Add Images'}
                  </Button>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>

                <div>
                  <RadioGroup
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as "grid" | "free")}
                    className="flex gap-4"
                  >
                    <FormControlLabel
                      value="grid"
                      control={<Radio />}
                      label={
                        <div className="flex items-center gap-1">
                          <GridView fontSize="small" />
                          Grid
                        </div>
                      }
                    />
                    <FormControlLabel
                      value="free"
                      control={<Radio />}
                      label={
                        <div className="flex items-center gap-1">
                          <Dashboard fontSize="small" />
                          Free
                        </div>
                      }
                    />
                  </RadioGroup>
                </div>

                {layout === "grid" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Grid Size</p>
                    <div className="flex gap-2">
                      <TextField
                        type="number"
                        value={gridSize.rows}
                        onChange={(e) =>
                          setGridSize((prev) => ({
                            ...prev,
                            rows: Math.max(1, parseInt(e.target.value) || 1),
                          }))
                        }
                        size="small"
                        className="w-20"
                        inputProps={{ min: 1 }}
                      />
                      <span className="text-gray-500 flex items-center">×</span>
                      <TextField
                        type="number"
                        value={gridSize.cols}
                        onChange={(e) =>
                          setGridSize((prev) => ({
                            ...prev,
                            cols: Math.max(1, parseInt(e.target.value) || 1),
                          }))
                        }
                        size="small"
                        className="w-20"
                        inputProps={{ min: 1 }}
                      />
                    </div>
                  </div>
                )}

                {showSettings && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Border Width</p>
                      <Slider
                        value={borderWidth}
                        onChange={(_, value) => setBorderWidth(value as number)}
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Border Color</p>
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Background Color</p>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    Download
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => setImages([])}
                    className="bg-red-50 hover:bg-red-100"
                  >
                    <Delete />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}