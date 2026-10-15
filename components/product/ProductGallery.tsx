'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, alt }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');

  const mainSrc = selectedImage || images[0] || '/products/printing.png';

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      {/* Main Image (LCP on Product Detail Page) */}
      <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <Image
          src={mainSrc}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={80}
          className="object-cover transition-all duration-300"
        />
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative aspect-square w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                (selectedImage === img || (!selectedImage && idx === 0))
                  ? 'border-amber-400 scale-105'
                  : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img || '/products/printing.png'}
                alt={`${alt} صورة مصغرة ${idx + 1}`}
                fill
                loading="lazy"
                sizes="80px"
                quality={70}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};