import React from 'react';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HomepageServices } from '@/components/home/HomepageServices';
import { HomepageExhibitions } from '@/components/home/HomepageExhibitions';
import { Testimonials } from '@/components/home/Testimonials';
import { connectToDatabase } from '@/lib/mongodb';
import HeroConfig from '@/models/HeroConfig';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Service from '@/models/Service';
import Exhibition from '@/models/Exhibition';

export const revalidate = 300;

async function getHomepageData() {
  await connectToDatabase();

  const [categories, products, services, exhibitions, heroConfig] = await Promise.all([
    Category.find({ active: { $ne: false } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('name nameAr slug image description active')
      .limit(8)
      .lean(),
    Product.find({ active: { $ne: false } })
      .sort({ featured: -1, bestseller: -1, newArrival: -1, createdAt: -1 })
      .select('name nameAr slug categorySlug description image basePrice rating reviewCount badge featured bestseller newArrival active')
      .limit(24)
      .lean(),
    Service.find({ active: true, showOnHomepage: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title titleAr slug image category shortDescription shortDescriptionAr description descriptionAr price priceLabel featured')
      .limit(6)
      .lean(),
    Exhibition.find({ active: true, showOnHomepage: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title titleAr slug image category shortDescriptionAr shortDescription description')
      .limit(6)
      .lean(),
    HeroConfig.findOne().lean(),
  ]);

  const configuredItems = (heroConfig?.items || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  const heroItems = await Promise.all(
    configuredItems.map(async (entry: any) => {
      const Model = entry.itemType === 'service' ? Service : Product;
      const document = await Model.findById(entry.itemId).lean();
      if (!document || document.active === false) return null;

      return {
        id: document._id ? String(document._id) : entry.itemId,
        slug: document.slug,
        itemType: entry.itemType,
        image: document.image || '/products/printing.png',
        titleAr: document.titleAr || document.nameAr || document.title || document.name,
        title: document.title || document.name || 'Product',
        nameAr: document.nameAr || document.titleAr || document.title || document.name,
        name: document.name || document.title || 'Product',
        hero: {
          badge: entry.badge || 'خدمة مميزة',
          customTitle: entry.customTitle || '',
          customTitleAr: entry.customTitleAr || '',
          sortOrder: entry.sortOrder || 0,
        },
      };
    })
  );

  return {
    categories: categories.map((item: any) => ({
      ...item,
      id: item._id ? String(item._id) : item.id,
      _id: undefined,
      itemCount: 0,
    })),
    products: products.map((item: any) => ({
      ...item,
      id: item._id ? String(item._id) : item.id,
      _id: undefined,
      name: item.name || item.title || '',
      nameAr: item.nameAr || item.titleAr || '',
    })),
    services: services.map((item: any) => ({
      ...item,
      id: item._id ? String(item._id) : item.id,
      _id: undefined,
      title: item.title || item.name || '',
      titleAr: item.titleAr || item.nameAr || '',
    })),
    exhibitions: exhibitions.map((item: any) => ({
      ...item,
      id: item._id ? String(item._id) : item.id,
      _id: undefined,
      title: item.title || item.name || '',
      titleAr: item.titleAr || item.nameAr || '',
    })),
    heroItems: heroItems.filter(Boolean),
  };
}

export default async function HomePage() {
  const { categories, products, services, exhibitions, heroItems } = await getHomepageData();

  return (
    <div className="space-y-4">
      <Hero initialHeroItems={heroItems} />

      <FeaturedProducts
        title="⭐ المنتجات المميزة"
        filter="featured"
        initialProducts={products}
        initialServices={services}
      />

      <FeaturedProducts
        title="🔥 الأكثر مبيعاً"
        filter="bestseller"
        initialProducts={products}
        initialServices={[]}
      />

      <FeaturedProducts
        title="🆕 أحدث المنتجات"
        filter="newArrival"
        initialProducts={products}
        initialServices={[]}
      />

      <Categories initialCategories={categories} />
      <HomepageServices initialServices={services} />
      <HomepageExhibitions initialItems={exhibitions} />
      <Testimonials />
    </div>
  );
}
