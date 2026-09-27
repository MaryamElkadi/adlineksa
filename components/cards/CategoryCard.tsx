import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link href={`/products?category=${category.slug}`}>
      <div dir="rtl" className="group relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-pointer shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300">
        <Image
          src={category.image || '/products/printing.png'}
          alt={category.nameAr || category.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                {category.itemCount ?? 0} منتج
              </span>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                {category.nameAr || category.name}
              </h3>
            </div>
            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-slate-950 transition-all font-bold">
              ←
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};