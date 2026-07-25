'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@/types';
import { api } from '@/services/api';
import { CategoryCard } from '@/components/cards/CategoryCard';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { api.getCategories().then(setCategories).catch(console.error); }, []);

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div><span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">Popular Printing Solutions</span><h2 className="text-3xl sm:text-4xl font-black text-brand-blue">Browse Category Catalog</h2></div>
          <a href="/categories" className="text-xs font-bold text-brand-blue hover:text-amber-600 flex items-center gap-1">View All Categories →</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.filter((category) => category.active !== false).map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      </div>
    </section>
  );
};
