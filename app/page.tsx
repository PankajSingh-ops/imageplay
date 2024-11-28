"use client"
import { useRouter } from 'next/navigation';
import Header from './common/header/Header';

export default function Home() {
  const navigate = useRouter();

  const items = [
    { name: 'Add Audio', path: 'pages/addaudio', color: 'from-purple-500 to-indigo-600', icon: '🎵' },
    { name: 'Base64', path: 'pages/converttobase', color: 'from-pink-500 to-rose-600', icon: '🔢' },
    { name: 'Collage', path: 'pages/collage', color: 'from-green-500 to-emerald-600', icon: '🖼️' },
    { name: 'Color', path: 'pages/color', color: 'from-yellow-500 to-amber-600', icon: '🎨' },
    { name: 'Compress', path: 'pages/compress', color: 'from-blue-500 to-cyan-600', icon: '📦' },
    { name: 'Crop', path: 'pages/crop', color: 'from-red-500 to-orange-600', icon: '✂️' },
    { name: 'Filter', path: 'pages/filter', color: 'from-indigo-500 to-purple-600', icon: '🌈' },
    { name: 'Grayscale', path: 'pages/grayscale', color: 'from-gray-500 to-zinc-600', icon: '⚪' },
    { name: 'Image to Docs', path: 'pages/documentss', color: 'from-teal-500 to-emerald-600', icon: '📄' },
    { name: 'JPG to PDF', path: 'pages/jpgtopdf', color: 'from-orange-500 to-red-600', icon: '📋' },
    { name: 'JPG to SVG', path: 'pages/jpgtosvg', color: 'from-cyan-500 to-blue-600', icon: '🔄' },
    { name: 'Overlay', path: 'pages/overlay', color: 'from-rose-500 to-pink-600', icon: '🔝' },
    { name: 'Remove Background', path: 'pages/remove', color: 'from-emerald-500 to-green-600', icon: '🗑️' },
    { name: 'Rotator', path: 'pages/rotator', color: 'from-amber-500 to-yellow-600', icon: '🔁' },
    { name: 'Sizer', path: 'pages/sizer', color: 'from-lime-500 to-green-600', icon: '📏' },
    { name: 'Text Extract', path: 'pages/textextract', color: 'from-sky-500 to-blue-600', icon: '📝' },
    { name: 'Webp Converter', path: 'pages/webpconverter', color: 'from-violet-500 to-indigo-600', icon: '🖥️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100">
      {/* Header */}
      <Header />

      {/* Grid Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.name}
              onClick={() => navigate.push(item.path)}
              className="group cursor-pointer relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <span className="text-5xl drop-shadow-md">
                  {item.icon}
                </span>
                <p className="text-lg font-bold uppercase tracking-wider drop-shadow-md">
                  {item.name}
                </p>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}