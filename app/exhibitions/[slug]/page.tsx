import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Exhibition from "@/models/Exhibition";
import Service from "@/models/Service";
import Product from "@/models/Product";
import { serializeDocument } from "@/lib/serializers";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { MediaGallery } from "@/components/media/MediaGallery";
import { formatCurrency } from "@/lib/utils";

async function getExhibition(slug: string) {
  await connectToDatabase();
  return Exhibition.findOne({ slug, active: true }).select("-__v");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = await getExhibition((await params).slug);
  if (!item) return { title: "المعرض غير موجود | خط الإعلان" };
  const title = item.titleAr || item.title;
  const description = item.shortDescriptionAr || item.descriptionAr;
  return {
    title: `${title} | خط الإعلان`,
    description,
    openGraph: { title, description, images: item.coverImage || item.image ? [item.coverImage || item.image] : [] },
  };
}

export default async function ExhibitionDetails({ params }: { params: Promise<{ slug: string }> }) {
  const item = await getExhibition((await params).slug);
  if (!item) notFound();

  const relatedServices = item.relatedServiceIds?.length
    ? await Service.find({ _id: { $in: item.relatedServiceIds }, active: true }).limit(4)
    : [];
  const relatedProducts = item.relatedProductIds?.length
    ? await Product.find({ _id: { $in: item.relatedProductIds }, active: { $ne: false } }).limit(4)
    : [];
  const images = item.images?.length
    ? [...item.images].sort((a, b) => Number(b.url === (item.coverImage || item.image)) - Number(a.url === (item.coverImage || item.image)))
    : [...new Set([item.coverImage || item.image, ...(item.gallery || [])])];
  const title = item.titleAr || item.title || "معرض";
  const date = item.date ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(item.date) : "";
  const end = item.endDate ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(item.endDate) : "";

  return (
    <div dir="rtl" className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-2">
        <MediaGallery images={images} videos={item.videos || []} alt={title} />
        <div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">{item.categoryAr || item.category}</span>
          <h1 className="mt-4 text-4xl font-black text-brand-blue">{title}</h1>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">{item.descriptionAr || item.description}</p>
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {item.locationAr || item.location ? <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">الموقع</dt><dd className="mt-1 text-sm font-black">{item.locationAr || item.location}</dd></div> : null}
            {date ? <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">التاريخ</dt><dd className="mt-1 text-sm font-black">{date}{end ? ` — ${end}` : ""}</dd></div> : null}
          </dl>
          <div className="mt-5 rounded-2xl bg-slate-900 p-5 text-white"><span className="text-xs text-slate-300">التسعير</span><p className="mt-1 text-xl font-black text-amber-400">{item.price !== undefined ? `${item.priceLabel || "يبدأ من"} ${formatCurrency(item.price)}` : item.priceLabel || "اطلب عرض سعر"}</p></div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/quote?category=${encodeURIComponent("تنظيم معارض")}&title=${encodeURIComponent(item.titleAr || "")}`} className="rounded-xl bg-amber-400 px-6 py-3 text-center text-sm font-black text-slate-900">اطلب تنظيم هذا المعرض</Link>
            <Link href="/contact" className="rounded-xl border border-slate-300 px-6 py-3 text-center text-sm font-black text-brand-blue">تواصل معنا</Link>
          </div>
        </div>
      </section>

      {(item.featuresAr?.length || item.servicesAr?.length) ? <section className="grid gap-6 border-t border-slate-200 pt-10 md:grid-cols-2">
        {item.featuresAr?.length ? <div><h2 className="text-2xl font-black text-brand-blue">مميزات التجهيز</h2><ul className="mt-4 space-y-2">{item.featuresAr.map((feature: string, index: number) => <li key={index} className="rounded-xl bg-slate-50 p-3 text-sm">✓ {feature}</li>)}</ul></div> : null}
        {item.servicesAr?.length ? <div><h2 className="text-2xl font-black text-brand-blue">يشمل</h2><ul className="mt-4 space-y-2">{item.servicesAr.map((service: string, index: number) => <li key={index} className="rounded-xl bg-slate-50 p-3 text-sm">✓ {service}</li>)}</ul></div> : null}
      </section> : null}

      {(relatedServices.length || relatedProducts.length) ? <section className="space-y-6 border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-black text-brand-blue">خدمات ومنتجات مرتبطة</h2>
        {relatedServices.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{relatedServices.map((service) => <ServiceCard key={service._id.toString()} service={serializeDocument(service)} />)}</div> : null}
        {relatedProducts.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{relatedProducts.map((product) => <ProductCard key={product._id.toString()} product={serializeDocument(product)} />)}</div> : null}
      </section> : null}
    </div>
  );
}
