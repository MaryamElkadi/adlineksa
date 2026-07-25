'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, alt }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <img
          src={selectedImage || images[0]}
          alt={alt}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative aspect-square w-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                selectedImage === img ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${alt} thumbnail ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
