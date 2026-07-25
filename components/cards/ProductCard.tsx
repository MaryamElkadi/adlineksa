'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant="yellow">{product.badge}</Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span className="capitalize">{product.categorySlug.replace('-', ' ')}</span>
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              ★ {product.rating} <span className="text-slate-400">({product.reviewCount})</span>
            </span>
          </div>

          <h3 className="text-base font-black text-brand-blue group-hover:text-amber-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Starting at</span>
            <span className="text-lg font-black text-brand-blue">
              {formatCurrency(product.basePrice)}
            </span>
          </div>

          <Link href={`/products?slug=${product.slug}`}>
            <Button size="sm" variant="yellow">
              Configure →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
