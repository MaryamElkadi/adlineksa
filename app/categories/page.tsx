'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@/types';
import { api } from '@/services/api';
import { CategoryCard } from '@/components/cards/CategoryCard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { api.getCategories().then(setCategories).catch(console.error); }, []);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.filter((category) => category.active !== false).map((category) => <CategoryCard key={category.id} category={category} />)}
      </div>
    </div>
  );
}