"use client";
import { useEffect, useMemo, useState } from "react";
import { Exhibition } from "@/types";
import { ExhibitionCard } from "@/components/cards/ExhibitionCard";
import { Input } from "@/components/forms/Input";
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
  useEffect(() => {
    fetch("/api/exhibitions")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const shown = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory =
          category === "الكل" ||
          item.category === category ||
          item.categoryAr === category;
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

        return matchesCategory && (!searchQuery.trim() || matchesSearch);
      }),
    [items, category, searchQuery],
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
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${category === c ? "bg-amber-400 text-slate-900" : "border border-slate-200 bg-white text-slate-600"}`}
            >
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="py-20 text-center text-sm text-slate-500">
            جاري تحميل المعارض...
          </p>
        ) : shown.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((x) => (
              <ExhibitionCard key={x.id} exhibition={x} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
            لا توجد معارض متاحة حالياً
          </div>
        )}
      </div>
    </div>
  );
}
