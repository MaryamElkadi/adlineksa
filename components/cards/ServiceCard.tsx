"use client";
import Link from "next/link";
import Image from "next/image";
import { Service } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  const image = service.image || "/products/printing.png";
  return <article dir="rtl" className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl">
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <Image src={image} alt={service.titleAr || service.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={72} className="object-cover transition-transform duration-500 group-hover:scale-105" />
      {service.featured && <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black text-slate-900 shadow">خدمة مميزة</span>}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <span className="mb-2 text-[11px] font-bold text-amber-700">{service.category}</span>
      <h3 className="text-lg font-black text-brand-blue">{service.titleAr || service.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{service.shortDescriptionAr || service.descriptionAr || service.shortDescription || service.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs font-black text-brand-blue">{service.price !== undefined ? `يبدأ من ${formatCurrency(service.price)}` : (service.priceLabel || "اطلب عرض سعر")}</span>
        <Link href={`/services/${service.slug}`} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-400 hover:text-slate-900">اعرف المزيد</Link>
      </div>
    </div>
  </article>;
}
