'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Product, Service } from '@/types';
import { api } from '@/services/api';
import { ProductCard } from '@/components/cards/ProductCard';
import { ServiceCard } from '@/components/cards/ServiceCard';

interface Props {
  title: string;
  filter: 'featured' | 'bestseller' | 'mostUsed' | 'newArrival';
}

export const FeaturedProducts: React.FC<Props> = ({
  title,
  filter,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const productList = await api.getProducts();
        setProducts(productList);
        // The featured homepage catalogue is shared by both entity types.
        // Other product-only shelves retain their original behaviour.
        if (filter === 'featured') {
          // This endpoint filters and sorts in MongoDB, avoiding a full service
          // catalogue download just to render this single homepage shelf.
          setServices(await api.getFeaturedServices());
        }
      } catch (error) {
        console.error(error);
      }
    };
    void load();
  }, [filter]);

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

  const featuredServices = filter === 'featured' ? services : [];

  if (filteredProducts.length === 0 && featuredServices.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-black text-brand-blue">
            {filter === 'featured' ? '⭐ المنتجات والخدمات المميزة' : title}
          </h2>

          <Link
            href="/products"
            className="text-sm font-bold text-brand-blue hover:text-amber-500 transition"
          >
            عرض جميع المنتجات ←
          </Link>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">

          {featuredServices
            .slice(0, 8)
            .map((service) => (
              <ServiceCard
                key={`service-${service.id}`}
                service={service}
              />
            ))}

          {filteredProducts
            .slice(0, filter === 'featured' ? Math.max(8, 16 - featuredServices.length) : 8)
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
