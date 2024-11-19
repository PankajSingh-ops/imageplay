"use client";
import React, { useState, ChangeEvent } from 'react';
import { Trash2 } from 'lucide-react';
import Header from '@/app/common/header/Header';

interface ImageConverterState {
  imageSrc: string | null;
  error: string | null;
  selectedFormat: string;
  loading: boolean;
}

const ImageToDocumentConverter = () => {
  const [state, setState] = useState<ImageConverterState>({
    imageSrc: null,
    error: null,
    selectedFormat: 'docx',
    loading: false,
  });

  const documentFormats = ['DOC', 'DOCX'];

  const resetState = () => {
    setState({
      imageSrc: null,
      error: null,
      selectedFormat: 'docx',
      loading: false,
    });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: 'File size should be under 2 MB', imageSrc: null }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: 'Please upload an image file', imageSrc: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setState(prev => ({
        ...prev,
        imageSrc: reader.result as string,
        error: null,
      }));
    };
    reader.onerror = () => {
      setState(prev => ({
        ...prev,
        error: 'Error reading file',
        imageSrc: null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, selectedFormat: event.target.value }));
  };

  const handleDelete = () => {
    resetState();
  };

  const handleConvert = async () => {
    if (!state.imageSrc) {
      setState(prev => ({ ...prev, error: 'Please upload an image first' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageSrc: state.imageSrc, selectedFormat: state.selectedFormat }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert image');
      }

      const data = await response.json();
      const link = document.createElement('a');
      link.href = data.convertedImage;
      link.download = `converted-image.${state.selectedFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resetState();
    } catch (err) {
      console.log(err);
      setState(prev => ({ ...prev, error: 'Conversion failed. Please try again.' }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
              Image to Document Converter
            </h1>

            <div className="mb-6">
              <label className="block w-full">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>
            </div>

            <select
              value={state.selectedFormat}
              onChange={handleFormatChange}
              className="w-full p-2 mb-6 border rounded-md"
            >
              {documentFormats.map((format) => (
                <option key={format} value={format.toLowerCase()}>
                  {format}
                </option>
              ))}
            </select>

            {state.imageSrc && (
              <div className="mb-6 relative">
                <button
                  onClick={handleDelete}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 size={20} />
                </button>
                <img
                  src={state.imageSrc}
                  alt="Preview"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}

            {state.error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {state.error}
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={state.loading || !state.imageSrc}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${state.loading || !state.imageSrc ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {state.loading ? 'Converting...' : `Convert to ${state.selectedFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageToDocumentConverter;
