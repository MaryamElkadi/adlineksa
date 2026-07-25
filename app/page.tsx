import React from 'react';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Services } from '@/components/home/Services';
import { Testimonials } from '@/components/home/Testimonials';
import { FAQ } from '@/components/home/FAQ';
import { CTA } from '@/components/home/CTA';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Services />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
