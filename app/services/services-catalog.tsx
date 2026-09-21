"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Service } from "@/types";
import { api } from "@/services/api";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Input } from "@/components/forms/Input";

const categories = [
  "الكل",
  "تصميم وإبداع",
  "Branding",
  "التسويق الرقمي",
  "السوشيال ميديا",
  "الإعلانات الخارجية",
  "الطباعة",
  "التصوير والإنتاج",
  "تطوير المواقع",
  "الهدايا الدعائية",
  "خدمات الشركات",
];

export default function ServicesCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category") || "الكل";

  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getServices(categoryParam !== "الكل" ? categoryParam : undefined)
      .then((data) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [categoryParam]);

  const visible = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        categoryParam === "الكل" ||
        service.category === categoryParam ||
        service.title === categoryParam ||
        service.titleAr === categoryParam;

      const searchableText = [
        service.title,
        service.titleAr,
        service.description,
        service.descriptionAr,
        service.category,
        service.shortDescription,
        service.shortDescriptionAr,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalized || searchableText.includes(normalized);

      return matchesCategory && matchesSearch;
    });
  }, [services, categoryParam, searchQuery]);

  const handleCategoryChange = (item: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (item === "الكل") {
      params.delete("category");
    } else {
      params.set("category", item);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const selectedTitle = categoryParam && categoryParam !== "الكل" ? categoryParam : "جميع الخدمات";

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-black text-brand-heading">{selectedTitle}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? "جاري التحميل..." : `${visible.length} خدمة`}
            </p>
          </div>

          <div className="w-full sm:w-80">
            <Input
              placeholder="البحث عن الخدمات..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="my-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleCategoryChange(item)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                categoryParam === item
                  ? "bg-amber-400 text-slate-900"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {!loading && visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
            لا توجد خدمات مطابقة للبحث أو التصنيف الحالي.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

