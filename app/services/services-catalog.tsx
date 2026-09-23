"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Service } from "@/types";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Input } from "@/components/forms/Input";
import { CatalogCardSkeleton } from "@/components/cards/CatalogCardSkeleton";

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
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();
    const category = categoryParam !== "الكل" ? categoryParam : "";

    fetch(`/api/services?page=1&limit=6${category ? `&category=${encodeURIComponent(category)}` : ""}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load services");
        return response.json() as Promise<{ items: Service[]; hasMore: boolean }>;
      })
      .then((data) => {
        setSelectedCategory(categoryParam);
        setServices(data.items);
        setPage(1);
        setHasMore(data.hasMore);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setHasMore(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [categoryParam]);

  const visible = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
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

      return matchesSearch;
    });
  }, [services, searchQuery]);

  const handleCategoryChange = (item: string) => {
    setSelectedCategory(item);
    setLoading(true);
    setPage(1);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");

      if (item === "الكل") {
        params.delete("category");
      } else {
        params.set("category", item);
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;
    const category = selectedCategory !== "الكل" ? selectedCategory : "";
    setLoadingMore(true);

    try {
      const response = await fetch(
        `/api/services?page=${nextPage}&limit=6${category ? `&category=${encodeURIComponent(category)}` : ""}`,
      );
      if (!response.ok) throw new Error("Could not load more services");
      const data = (await response.json()) as { items: Service[]; hasMore: boolean };
      setServices((current) => [...current, ...data.items]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const selectedTitle = selectedCategory && selectedCategory !== "الكل" ? selectedCategory : "جميع الخدمات";

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
              aria-pressed={selectedCategory === item}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === item
                  ? "bg-amber-400 text-slate-900"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && services.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => <CatalogCardSkeleton key={index} />)}
          </div>
        ) : !loading && visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
            لا توجد خدمات مطابقة للبحث أو التصنيف الحالي.
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${loading || isPending ? "opacity-60" : ""}`} aria-busy={loading || isPending}>
            {visible.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
            {loadingMore && Array.from({ length: 3 }, (_, index) => <CatalogCardSkeleton key={`loading-${index}`} />)}
          </div>
        )}
        {hasMore && !loading && (
          <div className="mt-8 flex flex-col items-center gap-2">
            {(loading || isPending) && <p className="text-xs font-bold text-slate-500">جاري تحديث الخدمات...</p>}
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-amber-400 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60"
            >
              {loadingMore ? "جاري تحميل المزيد..." : "عرض المزيد"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

