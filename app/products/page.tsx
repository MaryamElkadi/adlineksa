'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category, Product } from '@/types';
import { api } from '@/services/api';
import { ProductCard } from '@/components/cards/ProductCard';
import { SmartConfigurator } from '@/components/product/SmartConfigurator';
import { ProductGallery } from '@/components/product/ProductGallery';
import { Input } from '@/components/forms/Input';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category') || undefined;
  const slugParam = searchParams?.get('slug');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => { api.getCategories().then(setCategories).catch(console.error); }, []);
  useEffect(() => { api.getProducts(categoryParam).then((data) => { setProducts(data); setSelectedProduct(data.find((product) => product.slug === slugParam) || data[0] || null); }).catch(console.error); }, [categoryParam, slugParam]);
  const filteredProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.categorySlug.toLowerCase().includes(searchQuery.toLowerCase())), [products, searchQuery]);
  const selectedCategory = categories.find((category) => category.slug === categoryParam);
  if (!selectedProduct && products.length === 0) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">No products are available yet.</div>;
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">{selectedProduct && <div className="grid grid-cols-1 lg:grid-cols-2 gap-10"><div><ProductGallery images={selectedProduct.gallery.length ? selectedProduct.gallery : [selectedProduct.image]} alt={selectedProduct.name} /><div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3"><h1 className="text-2xl font-black text-white">{selectedProduct.name}</h1><p className="text-xs text-slate-300 leading-relaxed">{selectedProduct.description}</p><div className="flex items-center gap-4 text-xs font-semibold text-amber-400 pt-2 border-t border-slate-800"><span>★ {selectedProduct.rating} Rating</span><span>• {selectedProduct.reviewCount} Reviews</span></div></div></div><SmartConfigurator product={selectedProduct} /></div>}<div className="pt-12 border-t border-slate-200 space-y-6"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><div><h2 className="text-2xl font-black text-brand-heading">{selectedCategory?.nameAr || 'All Products'}</h2><p className="text-brand-body">{filteredProducts.length} products</p></div><div className="w-full sm:w-72"><Input placeholder="Search products..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{filteredProducts.map((product) => <button key={product.id} type="button" onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left cursor-pointer"><ProductCard product={product} /></button>)}</div></div></div>;
}
