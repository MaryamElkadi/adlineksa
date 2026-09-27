import { cache, Suspense } from 'react';
import { Hero } from '@/components/home/Hero';
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
import type { Category as CategoryType, Exhibition as ExhibitionType, Product as ProductType, Service as ServiceType } from '@/types';

export const revalidate = 300;

type ProductFilter = 'featured' | 'bestseller' | 'newArrival';
type SkeletonKind = 'products' | 'categories' | 'services';

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

async function HomepageProductSection({ filter, title }: { filter: ProductFilter; title: string }) {
  const [products, services] = await Promise.all([
    loadHomepageSection(`${filter} products`, async () => {
      await connectToDatabase();
      const items = await Product.find({ active: { $ne: false }, [filter]: true })
        .sort({ featured: -1, bestseller: -1, newArrival: -1, createdAt: -1 })
        .select('name nameAr slug categorySlug description image basePrice rating reviewCount badge featured bestseller newArrival active updatedAt')
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
  return <HomepageServices initialServices={await getHomepageServices()} />;
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

function HomepageSectionSkeleton({ kind, count }: { kind: SkeletonKind; count: number }) {
  const isCategories = kind === 'categories';
  const isProducts = kind === 'products';
  const sectionClass = isCategories ? 'bg-slate-50 py-16' : isProducts ? 'bg-white py-14' : 'bg-slate-50 py-16';
  const gridClass = isCategories
    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    : isProducts
      ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  const imageAspect = isCategories ? 'aspect-square' : isProducts ? 'aspect-[4/3]' : 'aspect-[16/10]';

  return (
    <section aria-busy="true" className={sectionClass} dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3" aria-hidden="true">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-56 max-w-full animate-pulse rounded bg-slate-200" />
        </div>
        <div className={`grid gap-6 ${gridClass}`} aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className={`${imageAspect} bg-slate-200`} />
              {!isCategories && (
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 rounded bg-slate-200" />
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              )}
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
      <Hero initialHeroItems={[]} />

      <Suspense fallback={<HomepageSectionSkeleton kind="products" count={8} />}>
        <HomepageProductSection filter="featured" title="⭐ المنتجات المميزة" />
      </Suspense>
      <Suspense fallback={<HomepageSectionSkeleton kind="products" count={8} />}>
        <HomepageProductSection filter="bestseller" title="🔥 الأكثر مبيعاً" />
      </Suspense>
      <Suspense fallback={<HomepageSectionSkeleton kind="products" count={8} />}>
        <HomepageProductSection filter="newArrival" title="🆕 أحدث المنتجات" />
      </Suspense>
      <Suspense fallback={<HomepageSectionSkeleton kind="categories" count={8} />}>
        <HomepageCategoriesSection />
      </Suspense>
      <Suspense fallback={<HomepageSectionSkeleton kind="services" count={6} />}>
        <HomepageServicesSection />
      </Suspense>
      <Suspense fallback={<HomepageSectionSkeleton kind="services" count={6} />}>
        <HomepageExhibitionsSection />
      </Suspense>
      <Testimonials />
    </div>
  );
}
