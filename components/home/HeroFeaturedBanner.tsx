'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface HeroItem {
  id: string;
  slug?: string;
  itemType?: 'service' | 'product';
  image?: string;
  titleAr?: string;
  title?: string;
  nameAr?: string;
  name?: string;
  hero?: { badge?: string; customTitle?: string; customTitleAr?: string; sortOrder?: number };
}

interface HeroFeaturedBannerProps {
  items: HeroItem[];
}

export const HeroFeaturedBanner: React.FC<HeroFeaturedBannerProps> = ({ items }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setIndex((prev) => (prev + 1) % items.length), 6500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const featuredItem = useMemo(() => items[index] ?? items[0], [items, index]);

  if (!featuredItem) return null;

  return (
    <div className="rounded-2xl border border-amber-300 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shrink-0">
          <Image
            src={featuredItem.image || '/products/printing.png'}
            alt={featuredItem.titleAr || featuredItem.nameAr || 'featured item'}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-black text-amber-700 block truncate">
            {featuredItem.hero?.badge || (featuredItem.itemType === 'service' ? 'خدمة مميزة' : 'منتج مميز')}
          </span>
          <h2 className="text-sm font-black text-brand-blue truncate">
            {featuredItem.hero?.customTitleAr || featuredItem.titleAr || featuredItem.nameAr || featuredItem.title || featuredItem.name}
          </h2>
        </div>
        <Link
          href={featuredItem.itemType === 'service' ? `/services/${featuredItem.slug}` : `/products/${featuredItem.slug}`}
          className="ms-auto rounded-lg bg-amber-400 px-3 py-2 text-[11px] font-black text-slate-900 shrink-0 hover:bg-amber-500 transition-colors"
        >
          {featuredItem.itemType === 'service' ? 'اطلب الخدمة' : 'اطلب الآن'}
        </Link>
      </div>
    </div>
  );
};
