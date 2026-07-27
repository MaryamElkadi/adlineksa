'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category, Product } from '@/types';
import { api } from '@/services/api';
import { ProductCard } from '@/components/cards/ProductCard';
import { Input } from '@/components/forms/Input';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category') || undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    api.getProducts(categoryParam)
      .then((data) => {
        setProducts(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [categoryParam]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (product.nameAr || product.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categorySlug.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  const selectedCategory = categories.find((category) => category.slug === categoryParam);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-brand-heading">
            {selectedCategory ? selectedCategory.nameAr || selectedCategory.name : 'جميع المنتجات'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'جاري التحميل...' : `${filteredProducts.length} منتج`}
          </p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder="البحث عن المنتجات..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {/* Product Catalog Grid */}
      {!isLoading && filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
          لا توجد منتجات مطابقة للبحث حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}