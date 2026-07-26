'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '@/types';
import { api } from '@/services/api';
import { ProductCard } from '@/components/cards/ProductCard';

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { api.getProducts().then(setProducts).catch(console.error); }, []);
  const featured = products.filter((product) => product.featured || product.bestseller).slice(0, 4);

  return (
    <section className="py-16 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              مصممة بإتقان لعلامتك التجارية
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue">
              أكثر مطبوعاتنا مبيعاً
            </h2>
          </div>
          <a href="/products" className="text-xs font-bold text-brand-blue hover:text-amber-600 flex items-center gap-1">
            عرض الكتالوج كاملًا ←
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
};