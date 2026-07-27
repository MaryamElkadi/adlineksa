'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/types';
import { api } from '@/services/api';
import { ProductGallery } from '@/components/product/ProductGallery';
import { SmartConfigurator } from '@/components/product/SmartConfigurator';
import { ProductCard } from '@/components/cards/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);

    // Fetch primary product details
    api
      .getProducts()
      .then((data) => {
        const foundProduct = data.find((p) => p.slug === slug) || null;
        setProduct(foundProduct);

        if (foundProduct) {
          // Fetch related products in the same category (excluding current product)
          api
            .getProducts(foundProduct.categorySlug)
            .then((categoryProducts) => {
              setRelatedProducts(
                categoryProducts.filter((p) => p.slug !== foundProduct.slug)
              );
            })
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div dir="rtl" className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500 font-semibold">
        جاري تحميل تفاصيل المنتج...
      </div>
    );
  }

  if (!product) {
    return (
      <div dir="rtl" className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500 font-bold">
        عذراً، المنتج غير موجود.
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Primary Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Gallery & Details */}
        <div className="space-y-6">
          <ProductGallery
            key={`gallery-${product.id}`}
            images={product.gallery?.length ? product.gallery : [product.image]}
            alt={product.nameAr || product.name}
          />

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {product.nameAr || product.name}
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-amber-400 pt-3 border-t border-slate-800">
              <span className="flex items-center gap-1">
                ★ تقييم {product.rating}
              </span>
              <span>•</span>
              <span>{product.reviewCount} مراجعة</span>
            </div>
          </div>
        </div>

        {/* Right Column: Smart Configurator */}
        <div>
          <SmartConfigurator
            key={`configurator-${product.id}`}
            product={product}
          />
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-brand-heading">
              منتجات ذات صلة
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              قد يعجبك أيضاً هذه المنتجات في نفس الفئة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}