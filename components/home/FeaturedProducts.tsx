'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { api } from '@/services/api';
import { ProductCard } from '@/components/cards/ProductCard';

interface Props {
  title: string;
  filter: 'featured' | 'bestseller' | 'mostUsed' | 'newArrival';
}

export const FeaturedProducts: React.FC<Props> = ({
  title,
  filter,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(console.error);
  }, []);

  const filteredProducts = useMemo(() => {
    switch (filter) {
      case 'featured':
        return products.filter(
          (product) => product.featured && product.active !== false
        );

      case 'bestseller':
        return products.filter(
          (product) => product.bestseller && product.active !== false
        );

      case 'newArrival':
        return products.filter(
          (product) => product.newArrival && product.active !== false
        );

      case 'mostUsed':
        // Temporary until you add a field in MongoDB
        return [...products]
          .filter((product) => product.active !== false)
          .sort((a, b) => b.reviewCount - a.reviewCount);

      default:
        return [];
    }
  }, [products, filter]);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-black text-brand-blue">
            {title}
          </h2>

          <Link
            href="/products"
            className="text-sm font-bold text-brand-blue hover:text-amber-500 transition"
          >
            عرض جميع المنتجات ←
          </Link>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">

          {filteredProducts
            .slice(0, 8)
            .map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

        </div>

      </div>
    </section>
  );
};