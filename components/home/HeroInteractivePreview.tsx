'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export const HeroInteractivePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'rollup' | 'box' | 'sticker'>('cards');
  const [qty, setQty] = useState(500);
  const [finish, setFinish] = useState('Velvet Soft-Touch + Gold Foil');

  // HERO PREVIEW PRODUCTS
  const previews = {
    cards: {
      name: 'Deluxe Roll Up Stand',
      nameAr: 'رول أب ستاند فاخر',
      base: 120,
      image: '/products/banner2.jpg',
      badge: 'Bestseller',
      slug: 'deluxe-rollup-stand',
    },
    rollup: {
      name: 'Premium Banner',
      nameAr: 'بانر فاخر',
      base: 195,
      image: '/products/rollup.jpg',
      badge: 'Popular',
      slug: 'premium-banner',
    },
    box: {
      name: 'Professional Printing',
      nameAr: 'طباعة احترافية',
      base: 250,
      image: '/products/printing.png',
      badge: 'Enterprise',
      slug: 'professional-printing',
    },
    sticker: {
      name: 'Premium Cards',
      nameAr: 'بطاقات فاخرة',
      base: 80,
      image: '/products/cards.jpg',
      badge: 'New',
      slug: 'luxe-business-cards',
    },
  };

  const activeProduct = previews[activeTab];

  const calculatedPrice = Math.round(
    (activeProduct.base / 100) *
    qty *
    (finish.includes('Foil') ? 1.3 : 1.1)
  );

  return (
    <div className="lg:col-span-5 relative order-2 lg:order-1">
      {/* FLOATING DYNAMIC PRICING CHIP */}
      <div className="absolute -top-4 -left-4 z-20 bg-white border border-amber-400 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-float">
        <span className="text-2xl">✨</span>
        <div>
          <div className="text-xs font-black text-brand-blue">
            Dynamic Pricing
          </div>
          <div className="text-[10px] text-slate-500">
            No waiting for quotes
          </div>
        </div>
      </div>

      {/* FLOATING DELIVERY CHIP */}
      <div
        className="absolute -bottom-4 -right-4 z-20 bg-brand-blue text-white shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-float"
        style={{ animationDelay: '1.5s' }}
      >
        <span className="text-2xl">🇸🇦</span>
        <div>
          <div className="text-xs font-black text-amber-400">
            Express Delivery KSA
          </div>
          <div className="text-[10px] text-slate-300">
            Direct to your office
          </div>
        </div>
      </div>

      {/* INTERACTIVE PREVIEW CARD */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 relative">
        {/* CATEGORY TABS */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          {(['cards', 'rollup', 'box', 'sticker'] as const).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`py-2 text-[11px] font-extrabold rounded-xl capitalize transition-all ${
                activeTab === tabKey
                  ? 'bg-brand-blue text-yellow-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tabKey}
            </button>
          ))}
        </div>

        {/* IMAGE PREVIEW (LCP Element) */}
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
          <Image
            src={activeProduct.image}
            alt={activeProduct.name}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 520px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="yellow">
              {activeProduct.badge}
            </Badge>
          </div>

          {/* Image Information */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-2.5 flex justify-between items-center shadow-md">
            <div>
              <h4 className="text-xs font-black text-brand-blue">
                {activeProduct.name}
              </h4>
              <p className="text-[10px] text-slate-500 font-arabic font-semibold">
                {activeProduct.nameAr}
              </p>
            </div>
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              Live Demo
            </span>
          </div>
        </div>

        {/* CONFIGURATION CONTROLS */}
        <div className="space-y-3 pt-1">
          {/* Quantity */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">Quantity Selector:</span>
            <span className="font-black text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              {qty} Units
            </span>
          </div>

          <input
            type="range"
            min="100"
            max="2500"
            step="100"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          {/* Finish */}
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="font-bold text-slate-700">Finishing Option:</span>
            <select
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              className="text-xs font-bold text-brand-blue bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="Velvet Soft-Touch + Gold Foil">
                Velvet + Gold Foil
              </option>
              <option value="Standard Matte">
                Standard Matte
              </option>
              <option value="High Gloss UV">
                High Gloss UV
              </option>
            </select>
          </div>
        </div>

        {/* PRICE BOX */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-blue rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
              Estimated Quote
            </span>
            <span className="text-2xl font-black text-amber-400">
              {formatCurrency(calculatedPrice)}
            </span>
          </div>

          <Link href={`/products?slug=${activeProduct.slug}`}>
            <Button size="sm" variant="yellow">
              Customize Order →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
