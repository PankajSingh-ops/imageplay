"use client";
import Header from "@/app/common/header/Header";
import { useRef, useState, useEffect, ChangeEvent } from "react";

declare global {
  interface HTMLAudioElement {
    captureStream(): MediaStream;
  }
}

export default function ImageMusicEditor() {
  const [images, setImages] = useState<string[]>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audioLength, setAudioLength] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const loadedImages = useRef<HTMLImageElement[]>([]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter((file) => file.size <= 2 * 1024 * 1024);
      if (validFiles.length !== files.length) {
        setError("Each file size should be under 2 MB.");
        return;
      }
      
      setImagesLoaded(false); // Reset loaded state
      loadedImages.current = []; // Clear previous loaded images
      
      const imagePromises = validFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );
      
      Promise.all(imagePromises).then((results) => {
        setImages(results);
        setError(null);
        
        // Preload all images
        const imageLoadPromises = results.map(
          (src) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.src = src;
            })
        );
        
        Promise.all(imageLoadPromises).then((loadedImgs) => {
          loadedImages.current = loadedImgs;
          setImagesLoaded(true);
          // Draw first image once loaded
          if (canvas.current && loadedImgs[0]) {
            const ctx = canvas.current.getContext('2d');
            canvas.current.width = loadedImgs[0].width;
            canvas.current.height = loadedImgs[0].height;
            ctx?.drawImage(loadedImgs[0], 0, 0);
          }
        });
      });
    }
  };

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Audio file size should be under 2 MB.");
        setAudio(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAudio(reader.result as string);
        setError(null);
        
        // Get audio duration
        const audio = new Audio(reader.result as string);
        audio.addEventListener('loadedmetadata', () => {
          setAudioLength(audio.duration);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image transitions
  useEffect(() => {
    if (isPlaying && images.length > 0 && loadedImages.current.length > 0) {
      const intervalTime = Math.max((audioLength * 1000) / images.length, 1000); // Minimum 1 second per image
      
      const drawImage = (index: number) => {
        if (canvas.current && loadedImages.current[index]) {
          const ctx = canvas.current.getContext('2d');
          if (ctx) {
            canvas.current.width = loadedImages.current[index].width;
            canvas.current.height = loadedImages.current[index].height;
            ctx.drawImage(loadedImages.current[index], 0, 0);
          }
        }
      };

      drawImage(currentImageIndex);
      
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const nextIndex = (prev + 1) % images.length;
          drawImage(nextIndex);
          return nextIndex;
        });
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [isPlaying, images.length, audioLength, currentImageIndex]);

  // Prepare recorder with delay to ensure first frame is captured
  const prepareRecorder = async () => {
    if (!canvas.current || !audioRef.current) return null;
    
    const stream = canvas.current.captureStream(30);
    
    try {
      const audioStream = audioRef.current.captureStream();
      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }
    } catch (error) {
      console.warn('Audio capture failed:', error);
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    return recorder;
  };

  const startSlideshow = async () => {
    if (!canvas.current || images.length === 0 || !audio || !imagesLoaded) {
      setError("Please wait for all images to load");
      return;
    }

    try {
      // Reset to first image
      setCurrentImageIndex(0);
      
      // Draw first frame before starting recording
      if (loadedImages.current[0]) {
        const ctx = canvas.current.getContext('2d');
        canvas.current.width = loadedImages.current[0].width;
        canvas.current.height = loadedImages.current[0].height;
        ctx?.drawImage(loadedImages.current[0], 0, 0);
      }

      // Wait a bit to ensure first frame is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const recorder = await prepareRecorder();
      if (!recorder) {
        setError("Failed to initialize recorder");
        return;
      }

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }

      recorder.start();
      setIsPlaying(true);
      setError(null);
    } catch (error) {
      setError("Failed to start recording: " + (error as Error).message);
    }
  };

  const stopAndDownload = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'video/webm' 
      });
      chunksRef.current = [];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'slideshow.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Image Slideshow with Background Music
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          multiple
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="mb-6 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <canvas ref={canvas} className="w-full mb-6 bg-gray-50 dark:bg-gray-700" />

        {audio && (
          <audio ref={audioRef} src={audio} loop={false} className="w-full mb-4" controls />
        )}

        <div className="space-y-4">
          <button
            onClick={startSlideshow}
            disabled={isPlaying || !imagesLoaded || !audio}
            className="w-full bg-blue-500 text-white py-2 rounded transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {!imagesLoaded ? "Loading Images..." : "Start Slideshow"}
          </button>

          <button
            onClick={stopAndDownload}
            disabled={!isPlaying}
            className="w-full bg-green-500 text-white py-2 rounded transition-colors hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Stop and Download Video
          </button>
        </div>
      </div>
    </div>
    </>
  );
}