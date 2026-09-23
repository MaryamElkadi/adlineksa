import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import Service from "@/models/Service";
import Product from "@/models/Product";
import { serializeDocument } from "@/lib/serializers";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { formatCurrency } from "@/lib/utils";

async function getService(slug: string) {
  await connectToDatabase();
  return Service.findOne({ slug, active: true });
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return { title: "الخدمة غير موجودة | خط الإعلان" };
  const title = service.titleAr || service.title;
  const description =
    service.shortDescriptionAr || service.descriptionAr || service.description;
  return {
    title: `${title} | خط الإعلان`,
    description,
    openGraph: {
      title,
      description,
      images: service.image ? [service.image] : [],
    },
  };
}
export default async function ServiceDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const serviceDoc = await getService((await params).slug);
  if (!serviceDoc) notFound();
  const service = serializeDocument(serviceDoc);
  const related = await Service.find({
    active: true,
    category: service.category,
    _id: { $ne: serviceDoc._id },
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(3);
  const products = service.relatedProductIds?.length
    ? await Product.find({
        _id: { $in: service.relatedProductIds },
        active: { $ne: false },
      })
    : [];
  return (
    <div
      dir="rtl"
      className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 lg:px-8"
    >
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-lg">
          <Image
            src={service.image || "/products/printing.png"}
            alt={service.titleAr || service.title}
            width={1200}
            height={900}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>
        <div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
            {service.category}
          </span>
          <h1 className="mt-4 text-4xl font-black text-brand-blue">
            {service.titleAr || service.title}
          </h1>
          {service.title && (
            <p className="mt-2 text-sm font-bold text-slate-400">
              {service.title}
            </p>
          )}
          <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">
            {service.descriptionAr || service.description}
          </p>
          <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
            <span className="text-xs text-slate-300">
              {service.price !== undefined ? "الأسعار" : "التسعير"}
            </span>
            <p className="mt-1 text-xl font-black text-amber-400">
              {service.price !== undefined
                ? `${service.priceLabel || "يبدأ من"} ${formatCurrency(service.price)}`
                : service.priceLabel || "اطلب عرض سعر"}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="rounded-xl bg-amber-400 px-6 py-3 text-center text-sm font-black text-slate-900"
            >
              {service.price !== undefined ? "اطلب الخدمة" : "اطلب عرض سعر"}
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-black text-brand-blue"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
      {products.length > 0 && (
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-black text-brand-blue">
            منتجات مرتبطة بالخدمة
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id.toString()}
                product={serializeDocument(product)}
              />
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-black text-brand-blue">خدمات ذات صلة</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ServiceCard
                key={item._id.toString()}
                service={serializeDocument(item)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
