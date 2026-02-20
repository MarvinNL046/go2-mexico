import Image from 'next/image';
import { useState } from 'react';

interface GallerySliderProps {
  images: string[];
  alt: string;
  className?: string;
}

const GallerySlider: React.FC<GallerySliderProps> = ({ images, alt, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={images[0]} alt={alt} fill className="object-cover" />
      </div>
    );
  }

  const goTo = (index: number) => {
    setCurrentIndex((index + images.length) % images.length);
  };

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <Image
        src={images[currentIndex]}
        alt={`${alt} - ${currentIndex + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
      />

      {/* Nav arrows */}
      <button
        onClick={(e) => { e.preventDefault(); goTo(currentIndex - 1); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={(e) => { e.preventDefault(); goTo(currentIndex + 1); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); goTo(i); }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-white w-4' : 'bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default GallerySlider;
