'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category, Product } from '@/types';
import { api } from '@/services/api';
import { ProductCard } from '@/components/cards/ProductCard';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category') || undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isInitialMount = useRef(true);

  // Fetch categories once (cached in memory)
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch initial batch of products on categoryParam change or debounced search
  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(
      () => {
        setIsLoading(true);
        setPage(1);

        api
          .getProducts({
            category: categoryParam,
            search: searchQuery.trim() || undefined,
            page: 1,
            limit: PAGE_SIZE,
            compact: true,
            format: 'paginated',
          })
          .then((res: any) => {
            if (isCancelled) return;
            const items = res?.products || (Array.isArray(res) ? res : []);
            setProducts(items);
            setTotalCount(res?.total ?? items.length);
            setHasMore(Boolean(res?.hasMore));
          })
          .catch((error) => {
            if (!isCancelled) {
              console.error('Failed to load products:', error);
              setProducts([]);
            }
          })
          .finally(() => {
            if (!isCancelled) setIsLoading(false);
          });
      },
      isInitialMount.current ? 0 : 350
    );

    isInitialMount.current = false;

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [categoryParam, searchQuery]);

  // Load next batch
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextPage = page + 1;
    try {
      const res: any = await api.getProducts({
        category: categoryParam,
        search: searchQuery.trim() || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
        compact: true,
        format: 'paginated',
      });

      const nextItems = res?.products || (Array.isArray(res) ? res : []);
      setProducts((prev) => [...prev, ...nextItems]);
      setPage(nextPage);
      setHasMore(Boolean(res?.hasMore));
    } catch (error) {
      console.error('Failed to load more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const selectedCategory = categories.find((cat) => cat.slug === categoryParam);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-brand-heading">
            {selectedCategory ? selectedCategory.nameAr || selectedCategory.name : 'جميع المنتجات'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading
              ? 'جاري التحميل...'
              : `عرض ${products.length} من أصل ${totalCount} منتج`}
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
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-96 animate-pulse"
            >
              <div className="aspect-[4/3] w-full bg-slate-200" />
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-5 w-16 bg-slate-200 rounded" />
                  <div className="h-8 w-20 bg-amber-100 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
          لا توجد منتجات مطابقة للبحث حالياً.
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index === 0} />
            ))}
            {isLoadingMore &&
              Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`more-skeleton-${i}`}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-96 animate-pulse"
                >
                  <div className="aspect-[4/3] w-full bg-slate-200" />
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-1/3 bg-slate-200 rounded" />
                      <div className="h-5 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3 w-full bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="yellow"
                size="lg"
                isLoading={isLoadingMore}
                onClick={handleLoadMore}
                className="px-8 shadow-md"
              >
                تحميل المزيد من المنتجات ({PAGE_SIZE}+)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}