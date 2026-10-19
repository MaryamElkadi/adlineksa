import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getProductStartingPriceDetails } from '@/lib/utils';
import { isOptimizableImageUrl } from '@/lib/media';

interface ProductCardProps {
  /**
   * Set to true for the above‑the‑fold product image to enable priority loading.
   */
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority }) => {
  const startingPrice = getProductStartingPriceDetails(
    product.basePrice,
    product.pricingType === 'tiered' || (!product.pricingType && product.configurableQuantityTiers?.length)
      ? product.configurableQuantityTiers
      : undefined
  );

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div
        dir="rtl"
        className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <Image
            src={product.coverImage || product.image || '/products/printing.png'}
            alt={product.nameAr || product.name}
            fill

            priority={Boolean(priority)}
            loading={priority ? undefined : 'lazy'}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            quality={75}
            unoptimized={!isOptimizableImageUrl(product.coverImage || product.image || '/products/printing.png')}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <div className="absolute top-3 right-3">
              <Badge variant="yellow">{product.badge}</Badge>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow justify-between gap-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="capitalize">
                {product.categorySlug?.replace('-', ' ') || 'منتج'}
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                ★ {product.rating}{' '}
                <span className="text-slate-400">({product.reviewCount})</span>
              </span>
            </div>

            <h3 className="text-base font-black text-brand-blue group-hover:text-amber-600 transition-colors line-clamp-1">
              {product.nameAr || product.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block">يبدأ من</span>
              <span className="text-lg font-black text-brand-blue">{formatCurrency(startingPrice.unitPrice)}</span>
              <span className="block text-[10px] text-slate-400">
                {product.pricingType === 'meter'
                  ? 'للمتر'
                  : startingPrice.quantity > 1 ? `لـ ${startingPrice.quantity} قطعة` : 'للقطعة'}
              </span>
            </div>

            <Button size="sm" variant="yellow" className="w-full sm:w-auto">
              تخصيص →
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};