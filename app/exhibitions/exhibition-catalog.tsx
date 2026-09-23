"use client";
import { useEffect, useMemo, useState } from "react";
import { Exhibition } from "@/types";
import { ExhibitionCard } from "@/components/cards/ExhibitionCard";
import { Input } from "@/components/forms/Input";
import { CatalogCardSkeleton } from "@/components/cards/CatalogCardSkeleton";
const categories = [
  "الكل",
  "تنظيم المعارض",
  "تصميم وتجهيز الأجنحة",
  "تجهيز الفعاليات",
  "المؤتمرات",
  "المعارض التجارية",
  "المعارض الخاصة",
  "الفعاليات المؤسسية",
  "إطلاق المنتجات",
  "تجهيز المساحات",
  "الديكور والهوية البصرية",
];
export default function ExhibitionCatalog() {
  const [items, setItems] = useState<Exhibition[]>([]);
  const [category, setCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const categoryParam = category !== "الكل" ? category : "";

    fetch(`/api/exhibitions?page=1&limit=6${categoryParam ? `&category=${encodeURIComponent(categoryParam)}` : ""}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load exhibitions");
        return response.json() as Promise<{ items: Exhibition[]; hasMore: boolean }>;
      })
      .then((data) => {
        setItems(data.items);
        setPage(1);
        setHasMore(data.hasMore);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setItems([]);
        setHasMore(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [category]);

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setLoading(true);
    setPage(1);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;
    const categoryParam = category !== "الكل" ? category : "";
    setLoadingMore(true);

    try {
      const response = await fetch(
        `/api/exhibitions?page=${nextPage}&limit=6${categoryParam ? `&category=${encodeURIComponent(categoryParam)}` : ""}`,
      );
      if (!response.ok) throw new Error("Could not load more exhibitions");
      const data = (await response.json()) as { items: Exhibition[]; hasMore: boolean };
      setItems((current) => [...current, ...data.items]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };
  const shown = useMemo(
    () =>
      items.filter((item) => {
        const searchableText = [
          item.title,
          item.titleAr,
          item.description,
          item.descriptionAr,
          item.category,
          item.categoryAr,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesSearch = searchableText.includes(searchQuery.trim().toLowerCase());

        return !searchQuery.trim() || matchesSearch;
      }),
    [items, searchQuery],
  );
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black text-brand-heading">جميع المعارض</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "جاري التحميل..." : `${shown.length} معرض`}
            </p>
          </div>
          <div className="w-full sm:w-80">
            <Input
              placeholder="البحث عن المعارض..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="my-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => handleCategoryChange(c)}
              aria-pressed={category === c}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${category === c ? "bg-amber-400 text-slate-900" : "border border-slate-200 bg-white text-slate-600"}`}
            >
              {c}
            </button>
          ))}
        </div>
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => <CatalogCardSkeleton key={index} />)}
          </div>
        ) : shown.length ? (
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
            {shown.map((x) => (
              <ExhibitionCard key={x.id} exhibition={x} />
            ))}
            {loadingMore && Array.from({ length: 3 }, (_, index) => <CatalogCardSkeleton key={`loading-${index}`} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
            لا توجد معارض متاحة حالياً
          </div>
        )}
        {hasMore && !loading && (
          <div className="mt-8 flex justify-center">
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
