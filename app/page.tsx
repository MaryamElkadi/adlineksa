import React from 'react';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts, FeaturedProducts as FeaturedProductsComponent } from '@/components/home/FeaturedProducts';
import { HomepageServices } from '@/components/home/HomepageServices';
import { HomepageExhibitions } from '@/components/home/HomepageExhibitions';
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
    title="🆕 أحدث المنتجات"
    filter="newArrival"
/>
  <Categories />
      <HomepageServices />
      <HomepageExhibitions />
      <Testimonials />
      {/* <FAQ /> */}
      {/* <CTA /> */}
    </div>
  );
}
