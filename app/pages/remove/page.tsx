"use client"
import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  Box,
  Container,
  Alert,
  Snackbar,
  Slider,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Delete,
  Compare,
  Tune,
} from '@mui/icons-material';
import Header from '@/app/common/header/Header';

interface ProcessedImage {
  original: string;
  processed: string;
}

export default function BackgroundRemover() {
  const [images, setImages] = useState<ProcessedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const removeBackground = (
    imageData: ImageData,
    tolerance: number
  ): ImageData => {
    const pixels = imageData.data;
    
    // Get the background color from the top-left pixel
    const bgRed = pixels[0];
    const bgGreen = pixels[1];
    const bgBlue = pixels[2];

    // Process each pixel
    for (let i = 0; i < pixels.length; i += 4) {
      const red = pixels[i];
      const green = pixels[i + 1];
      const blue = pixels[i + 2];

      // Calculate color difference
      const colorDiff = Math.sqrt(
        Math.pow(red - bgRed, 2) +
        Math.pow(green - bgGreen, 2) +
        Math.pow(blue - bgBlue, 2)
      );

      // If color is similar to background, make it transparent
      if (colorDiff < tolerance) {
        pixels[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }

    return imageData;
  };

  const processImage = async (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error('Canvas not available'));
          return;
        }

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Remove background
        const processedImageData = removeBackground(imageData, tolerance);

        // Clear canvas and draw processed image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(processedImageData, 0, 0);

        // Convert canvas to data URL
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageSrc;
    });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const originalImage = e.target?.result as string;
        try {
          const processedImage = await processImage(originalImage);
          setImages({
            original: originalImage,
            processed: processedImage,
          });
        } catch (err) {
          console.error(err);
          setError('Failed to process image. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to load image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToleranceChange = async (_: Event, value: number | number[]) => {
    setTolerance(value as number);
    if (images?.original) {
      setIsLoading(true);
      try {
        const processedImage = await processImage(images.original);
        setImages({
          ...images,
          processed: processedImage,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to update image processing');
      }
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (images?.processed) {
      const link = document.createElement('a');
      link.href = images.processed;
      link.download = 'processed-image.png';
      link.click();
    }
  };

  const handleReset = () => {
    setImages(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
    <Header/>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Background Remover
          </Typography>
          <Box>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              sx={{ mr: 1 }}
            >
              Upload Image
            </Button>
            {images && (
              <IconButton
                color="error"
                onClick={handleReset}
                disabled={isLoading}
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Tolerance Slider */}
        {images && (
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Color Tolerance
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tune sx={{ mr: 2 }} />
              <Slider
                value={tolerance}
                onChange={handleToleranceChange}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                disabled={isLoading}
              />
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 2,
          minHeight: '400px'
        }}>
          {/* Original Image Display */}
          <Paper
            variant="outlined"
            sx={{
              height: '400px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#f5f5f5'
            }}
          >
            {images?.original ? (
              <img
                src={images.original}
                alt="Original"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Compare sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Original Image</Typography>
              </Box>
            )}
          </Paper>

          {/* Processed Image Display */}
          <Paper
            variant="outlined"
            sx={{
              height: '400px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#f5f5f5'
            }}
          >
            {isLoading ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Processing Image...</Typography>
              </Box>
            ) : images?.processed ? (
              <img
                src={images.processed}
                alt="Processed"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Compare sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Processed Image</Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {images?.processed && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Download />}
              onClick={handleDownload}
            >
              Download Processed Image
            </Button>
          </Box>
        )}
      </Paper>

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
    </>
  );
}