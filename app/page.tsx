"use client";
import { useRouter } from 'next/navigation';
import Header from './common/header/Header';

export default function Home() {
  const navigate = useRouter();

  const items = [
    { name: 'Add Audio', path: 'pages/addaudio' },
    { name: 'Base64', path: 'pages/converttobase' },
    { name: 'Overlay', path: 'pages/overlay', icon: "" },
    { name: 'Filter', path: 'pages/filter' },
    
    { name: 'Compress', path: 'pages/compress' },
    { name: 'Sizer', path: 'pages/sizer' },
    { name: 'Collage', path: 'pages/collage' },
    { name: 'Rotator', path: 'pages/rotator' },
    { name: 'Color', path: 'pages/color' },

    { name: 'Grayscale', path: 'pages/grayscale' },
    { name: 'Crop', path: 'pages/crop' },
    { name: 'Remove backgound', path: 'pages/remove' },
    { name: 'JPG TO PDF', path: 'pages/jpgtopdf' },
    { name: 'Text Extract', path: 'pages/textextract' },


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
                {item.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
