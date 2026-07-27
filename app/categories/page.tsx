'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@/types';
import { api } from '@/services/api';
import { CategoryCard } from '@/components/cards/CategoryCard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { api.getCategories().then(setCategories).catch(console.error); }, []);
  const activeCategories = categories.filter(
  (category) => category.active !== false
);

// Main categories shown on Home
const featuredCategories = activeCategories
  .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  .slice(0, 6);

// Remaining categories
const remainingCategories = activeCategories
  .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  .slice(6);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
          دليل المنتجات
        </span>
        <h1 className="text-4xl font-black text-slate-800">
          فئات الطباعة
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          تصفح مجموعتنا الكاملة من خدمات الأوفست الرقمي، الطباعة الخارجية العريضة، التغليف، والهدايا الترويجية للشركات.
        </p>
      </div>
      {/* Featured Categories */}

<div className="mb-12">
  <h3 className="text-2xl font-black text-brand-blue mb-6">
    ⭐ أهم الفئات
  </h3>

<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">    {featuredCategories.map((category) => (
      <CategoryCard
        key={category.id}
        category={category}
      />
    ))}
  </div>
</div>

{/* All Categories */}

<div>
  <h3 className="text-2xl font-black text-brand-blue mb-6">
    📂 جميع الفئات
  </h3>

<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">    {remainingCategories.map((category) => (
      <CategoryCard
        key={category.id}
        category={category}
      />
    ))}
  </div>
</div>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        

        {categories.filter((category) => category.active !== false).map((category) => <CategoryCard key={category.id} category={category} />)}
      </div> */}
    </div>
  );
}