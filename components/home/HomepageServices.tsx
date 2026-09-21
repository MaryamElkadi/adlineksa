"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Service } from "@/types";
import { ServiceCard } from "@/components/cards/ServiceCard";

export function HomepageServices() {
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => { fetch("/api/services/homepage").then((r) => r.ok ? r.json() : []).then(setServices).catch(() => {}); }, []);
  if (!services.length) return null;
  return <section dir="rtl" className="bg-slate-50 py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><span className="text-xs font-black text-amber-600">خدماتنا</span><h2 className="mt-2 text-3xl font-black text-brand-blue">حلول إعلانية متكاملة</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">من الفكرة إلى التنفيذ، نقدم خدمات إبداعية وتسويقية تساعد علامتك التجارية على الظهور والنمو.</p></div>
        <Link href="/services" className="text-sm font-black text-brand-blue hover:text-amber-600">عرض جميع الخدمات ←</Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>
    </div>
  </section>;
}
