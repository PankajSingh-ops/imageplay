"use client";
import { useRouter } from 'next/navigation';
import Header from './common/header/Header';

export default function Home() {
  const navigate = useRouter();

  const items = [
    { name: 'Add Audio', path: 'pages/addaudio', icon:'' },
    { name: 'Base64', path: 'pages/converttobase' },
    { name: 'Collage', path: 'pages/collage' },
    { name: 'Color', path: 'pages/color' },
    { name: 'Compress', path: 'pages/compress' },
    { name: 'Crop', path: 'pages/crop' },
    { name: 'Filter', path: 'pages/filter' },
    { name: 'Grayscale', path: 'pages/grayscale' },
    { name: 'IMAGE TO DOCS', path: 'pages/documentss' },
    { name: 'JPG TO PDF', path: 'pages/jpgtopdf' },
    { name: 'JPG TO SVG', path: 'pages/jpgtosvg' },
    { name: 'Overlay', path: 'pages/overlay', icon: "" },
    { name: 'Remove backgound', path: 'pages/remove' },
    { name: 'Rotator', path: 'pages/rotator' },
    { name: 'Sizer', path: 'pages/sizer' },
    { name: 'Text Extract', path: 'pages/textextract' },
    { name: 'Webp Converter', path: 'pages/webpconverter' },

];

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
      {/* Header */}
     <Header />

      {/* Grid Container */}
      <div className="container mx-auto p-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.name}
            onClick={() => navigate.push(item.path)}
            className="group cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              {item.icon || (
                <span className="text-4xl font-semibold text-blue-500 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  {item.name[0]}
                </span>
              )}
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {item.name.toUpperCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
