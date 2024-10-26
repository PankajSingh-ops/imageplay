"use client"
import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Button,
  CircularProgress,
  Paper,
  Typography,
  Box,
  Container,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Delete,
  Compare,
} from '@mui/icons-material';
import Header from '@/app/common/header/Header';

interface ProcessedImage {
  original: string;
  svg: string;
}

export default function ImageToSvgConverter() {
  const [images, setImages] = useState<ProcessedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const convertToSvg = async (imageSrc: string): Promise<string> => {
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
        
        // Create SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${img.width} ${img.height}">`;
        
        // Simple path tracing - this is a basic implementation
        // In a real application, you'd want to use a more sophisticated algorithm
        for (let y = 0; y < img.height; y += 2) {
          for (let x = 0; x < img.width; x += 2) {
            const i = (y * img.width + x) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            
            if (a > 128) { // Only draw visible pixels
              svg += `<circle cx="${x}" cy="${y}" r="1" fill="rgb(${r},${g},${b})" />`;
            }
          }
        }
        
        svg += '</svg>';

        // Convert to data URL
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        resolve(svgUrl);
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
          const svgImage = await convertToSvg(originalImage);
          setImages({
            original: originalImage,
            svg: svgImage,
          });
        } catch (err) {
          console.error(err);
          setError('Failed to convert image to SVG. Please try again.');
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

  const handleDownload = () => {
    if (images?.svg) {
      const link = document.createElement('a');
      link.href = images.svg;
      link.download = 'converted-image.svg';
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
            Image to SVG Converter
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
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>

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

          {/* SVG Image Display */}
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
                <Typography sx={{ mt: 2 }}>Converting to SVG...</Typography>
              </Box>
            ) : images?.svg ? (
              <img
                src={images.svg}
                alt="SVG"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Compare sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Converted SVG</Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {images?.svg && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Download />}
              onClick={handleDownload}
            >
              Download SVG
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