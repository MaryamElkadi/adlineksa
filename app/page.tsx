import { cache, Suspense } from 'react';
import { Hero } from '@/components/home/Hero';
import { HeroFeaturedBanner } from '@/components/home/HeroFeaturedBanner';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HomepageServices } from '@/components/home/HomepageServices';
import { HomepageExhibitions } from '@/components/home/HomepageExhibitions';
import { Testimonials } from '@/components/home/Testimonials';
import { connectToDatabase } from '@/lib/mongodb';
import { homepageImageUrl } from '@/lib/homepageImage';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Service from '@/models/Service';
import Exhibition from '@/models/Exhibition';
import HeroConfig from '@/models/HeroConfig';
import type { Category as CategoryType, Exhibition as ExhibitionType, Product as ProductType, Service as ServiceType } from '@/types';

export const revalidate = 300;

type ProductFilter = 'featured' | 'bestseller' | 'newArrival';

async function loadHomepageSection<T>(name: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`Could not load homepage ${name}`, error);
    return fallback;
  }
}

const getHomepageServices = cache(async (): Promise<ServiceType[]> => loadHomepageSection(
  'services',
  async () => {
    await connectToDatabase();
    const services = await Service.find({ active: true, showOnHomepage: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title titleAr slug image category shortDescription shortDescriptionAr description descriptionAr price priceLabel featured updatedAt')
      .limit(6)
      .lean();

    return services.map((service: any) => ({
      id: String(service._id),
      title: service.title || service.name || '',
      titleAr: service.titleAr || service.nameAr || '',
      slug: service.slug,
      image: homepageImageUrl('services', String(service._id), service.image, service.updatedAt),
      category: service.category,
      shortDescription: service.shortDescription,
      shortDescriptionAr: service.shortDescriptionAr,
      description: service.description,
      descriptionAr: service.descriptionAr,
      price: service.price,
      priceLabel: service.priceLabel,
      featured: service.featured,
    } as ServiceType));
  },
  [],
));

const getHomepageHeroItems = cache(async () => {
  return loadHomepageSection('hero items', async () => {
    await connectToDatabase();

    const config = await HeroConfig.findOne().select('items').lean();
    const configuredItems = (config?.items || []).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const productIds = configuredItems.filter((item: any) => item.itemType !== 'service').map((item: any) => item.itemId);
    const serviceIds = configuredItems.filter((item: any) => item.itemType === 'service').map((item: any) => item.itemId);

    const [products, services] = await Promise.all([
      productIds.length ? Product.find({ _id: { $in: productIds } }).select('name nameAr title titleAr slug image active updatedAt').lean() : [],
      serviceIds.length ? Service.find({ _id: { $in: serviceIds } }).select('name nameAr title titleAr slug image active updatedAt').lean() : [],
    ]);

    const documentMap = new Map([...products, ...services].map((document: any) => [String(document._id), document]));

    const configuredHeroItems = configuredItems
      .map((entry: any) => {
        const doc = documentMap.get(String(entry.itemId));
        if (!doc || doc.active === false) return null;
        const itemType = entry.itemType === 'service' ? 'service' : 'product';
        const collection = itemType === 'service' ? 'services' : 'products';
        return {
          id: String(doc._id),
          slug: doc.slug,
          itemType,
          image: homepageImageUrl(collection, String(doc._id), doc.image, doc.updatedAt),
          name: doc.name || doc.title || 'Product',
          nameAr: doc.nameAr || doc.titleAr || doc.title || doc.name || 'منتج',
          title: doc.title || doc.name || 'Product',
          titleAr: doc.titleAr || doc.nameAr || doc.title || doc.name || 'منتج',
          hero: {
            badge: entry.badge || (itemType === 'service' ? 'خدمة مميزة' : 'منتج مميز'),
            customTitle: entry.customTitle || '',
            customTitleAr: entry.customTitleAr || '',
            sortOrder: entry.sortOrder,
          },
        };
      })
      .filter(Boolean);

    const autoServices = await Service.find({ showInHero: true, active: true })
      .select('name nameAr title titleAr slug image active updatedAt')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(4)
      .lean();

    const configuredIds = new Set(configuredItems.map((item: any) => String(item.itemId)));

    const automaticItems = autoServices
      .filter((service: any) => !configuredIds.has(String(service._id)))
      .map((service: any) => ({
        id: String(service._id),
        slug: service.slug,
        itemType: 'service' as const,
        image: homepageImageUrl('services', String(service._id), service.image, service.updatedAt),
        name: service.name || service.title || 'Service',
        nameAr: service.nameAr || service.titleAr || service.title || service.name || 'خدمة',
        title: service.title || service.name || 'Service',
        titleAr: service.titleAr || service.nameAr || service.title || service.name || 'خدمة',
        hero: { badge: 'خدمة مميزة', customTitle: '', customTitleAr: '', sortOrder: 999 },
      }));

    return [...configuredHeroItems, ...automaticItems];
  }, []);
});

async function HomepageHeroBanner() {
  const heroItems = await getHomepageHeroItems();
  if (!heroItems || heroItems.length === 0) return null;
  return <HeroFeaturedBanner items={heroItems} />;
}

async function HomepageProductSection({ filter, title }: { filter: ProductFilter; title: string }) {
  const [products, services] = await Promise.all([
    loadHomepageSection(`${filter} products`, async () => {
      await connectToDatabase();
      const items = await Product.find({ active: { $ne: false }, [filter]: true })
        .sort({ featured: -1, bestseller: -1, newArrival: -1, createdAt: -1 })
        .select('name nameAr slug categorySlug description image basePrice configurableQuantityTiers rating reviewCount badge featured bestseller newArrival active updatedAt')
        .limit(filter === 'featured' ? 16 : 8)
        .lean();

      return items.map((item: any) => ({
        id: String(item._id),
        name: item.name || item.title || '',
        nameAr: item.nameAr || item.titleAr || '',
        slug: item.slug,
        categorySlug: item.categorySlug,
        description: item.description,
        image: homepageImageUrl('products', String(item._id), item.image, item.updatedAt),
        basePrice: item.basePrice,
        configurableQuantityTiers: item.configurableQuantityTiers,
        rating: item.rating,
        reviewCount: item.reviewCount,
        badge: item.badge,
        featured: item.featured,
        bestseller: item.bestseller,
        newArrival: item.newArrival,
        active: item.active,
      } as ProductType));
    }, [] as ProductType[]),
    filter === 'featured' ? getHomepageServices() : Promise.resolve([] as ServiceType[]),
  ]);

  return <FeaturedProducts title={title} filter={filter} initialProducts={products} initialServices={services} />;
}

async function HomepageCategoriesSection() {
  const categories = await loadHomepageSection('categories', async () => {
    await connectToDatabase();
    const items = await Category.find({ active: { $ne: false } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('name nameAr slug image active updatedAt')
      .limit(8)
      .lean();

    return items.map((item: any) => ({
      id: String(item._id),
      name: item.name,
      nameAr: item.nameAr,
      slug: item.slug,
      active: item.active,
      itemCount: 0,
      image: homepageImageUrl('categories', String(item._id), item.image, item.updatedAt),
    } as CategoryType));
  }, [] as CategoryType[]);

  return <Categories initialCategories={categories} />;
}

async function HomepageServicesSection() {
  const services = await getHomepageServices();
  return <HomepageServices initialServices={services} />;
}

async function HomepageExhibitionsSection() {
  const exhibitions = await loadHomepageSection('exhibitions', async () => {
    await connectToDatabase();
    const items = await Exhibition.find({ active: true, showOnHomepage: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title titleAr slug image category categoryAr shortDescriptionAr shortDescription descriptionAr location locationAr date price priceLabel featured updatedAt')
      .limit(6)
      .lean();

    return items.map((item: any) => ({
      id: String(item._id),
      title: item.title,
      titleAr: item.titleAr,
      slug: item.slug,
      image: homepageImageUrl('exhibitions', String(item._id), item.image, item.updatedAt),
      category: item.category,
      categoryAr: item.categoryAr,
      shortDescriptionAr: item.shortDescriptionAr,
      shortDescription: item.shortDescription,
      descriptionAr: item.descriptionAr,
      location: item.location,
      locationAr: item.locationAr,
      date: item.date,
      price: item.price,
      priceLabel: item.priceLabel,
      featured: item.featured,
    } as ExhibitionType));
  }, [] as ExhibitionType[]);

  return <HomepageExhibitions initialItems={exhibitions} />;
}

// SKELETON LOADERS MATCHING EXACT SECTION DESIGNS

function CategoriesSkeleton() {
  return (
    <section aria-busy="true" className="py-16 bg-slate-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4" aria-hidden="true">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
              حلول الطباعة الشائعة
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue">
              تصفح دليل الفئات
            </h2>
          </div>
          <span className="text-xs font-bold text-brand-blue flex items-center gap-1 opacity-70">
            عرض جميع الفئات ←
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-square w-full rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
              <div className="w-full h-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsSectionSkeleton({ title }: { title: string }) {
  return (
    <section aria-busy="true" className="py-14 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8" aria-hidden="true">
          <h2 className="text-3xl font-black text-brand-blue">{title}</h2>
          <span className="text-sm font-bold text-brand-blue opacity-70">عرض جميع المنتجات ←</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-full animate-pulse">
              <div className="aspect-[4/3] w-full bg-slate-200" />
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="h-3 w-12 bg-slate-200 rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-6 w-20 bg-slate-200 rounded" />
                  <div className="h-8 w-20 bg-amber-100 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSectionSkeleton() {
  return (
    <section aria-busy="true" className="bg-slate-50 py-16" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end" aria-hidden="true">
          <div>
            <span className="text-xs font-black text-amber-600">خدماتنا</span>
            <h2 className="mt-2 text-3xl font-black text-brand-blue">حلول إعلانية متكاملة</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">من الفكرة إلى التنفيذ، نقدم خدمات إبداعية وتسويقية تساعد علامتك التجارية على الظهور والنمو.</p>
          </div>
          <span className="text-sm font-black text-brand-blue opacity-70">عرض جميع الخدمات ←</span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col animate-pulse">
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-300 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExhibitionsSectionSkeleton() {
  return (
    <section aria-busy="true" className="bg-white py-16" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end" aria-hidden="true">
          <div>
            <span className="text-xs font-black text-amber-600">EXHIBITIONS & EVENTS</span>
            <h2 className="mt-2 text-3xl font-black text-brand-blue">تنفيذ المعارض والفعاليات</h2>
            <p className="mt-2 text-sm text-slate-600">حلول متكاملة لتنفيذ وتجهيز المعارض والفعاليات باحترافية.</p>
          </div>
          <span className="text-sm font-black text-brand-blue opacity-70">عرض جميع خدمات تنفيذ المعارض ←</span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col animate-pulse">
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-300 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-4">
      {/* 1. HERO - Server Component, renders immediately with zero database delay */}
      <Hero
        featuredSlot={
          <Suspense fallback={null}>
            <HomepageHeroBanner />
          </Suspense>
        }
      />

      {/* 2. FEATURED PRODUCTS AND SERVICES */}
      <Suspense fallback={<ProductsSectionSkeleton title="⭐ المنتجات المميزة" />}>
        <HomepageProductSection filter="featured" title="⭐ المنتجات المميزة" />
      </Suspense>

      {/* 3. LATEST PRODUCTS */}
      <Suspense fallback={<ProductsSectionSkeleton title="🆕 أحدث المنتجات" />}>
        <HomepageProductSection filter="newArrival" title="🆕 أحدث المنتجات" />
      </Suspense>

      <Suspense fallback={<ProductsSectionSkeleton title="🔥 الأكثر مبيعاً" />}>
        <HomepageProductSection filter="bestseller" title="🔥 الأكثر مبيعاً" />
      </Suspense>

      {/* 4. CATEGORIES */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <HomepageCategoriesSection />
      </Suspense>

      {/* 5. EXHIBITIONS AND EVENTS */}
      <Suspense fallback={<ExhibitionsSectionSkeleton />}>
        <HomepageExhibitionsSection />
      </Suspense>

      {/* Additional homepage sections */}
      <Testimonials />

      <Suspense fallback={<ServicesSectionSkeleton />}>
        <HomepageServicesSection />
      </Suspense>
    </div>
  );
}
