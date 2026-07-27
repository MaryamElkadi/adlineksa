import React from 'react';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts, FeaturedProducts as FeaturedProductsComponent } from '@/components/home/FeaturedProducts';
import { Services } from '@/components/home/Services';
import { Testimonials } from '@/components/home/Testimonials';
import { FAQ } from '@/components/home/FAQ';
import { CTA } from '@/components/home/CTA';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <Hero />
    
      <FeaturedProducts
    title="⭐ المنتجات المميزة"
    filter="featured"
/>

<FeaturedProducts
    title="🔥 الأكثر مبيعاً"
    filter="bestseller"
/>

<FeaturedProducts
    title="🏆 الأكثر استخداماً"
    filter="mostUsed"
/>

<FeaturedProducts
    title="🆕 أحدث المنتجات"
    filter="newArrival"
/>
  <Categories />
      {/* <Services /> */}
      <Testimonials />
      {/* <FAQ /> */}
      {/* <CTA /> */}
    </div>
  );
}
