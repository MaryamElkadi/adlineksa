"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Exhibition } from "@/types";

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

export default function AdminExhibitions() {
  const [items, setItems] = useState<Exhibition[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [message, setMessage] = useState("");

  const load = () =>
    fetch("/api/exhibitions?admin=true")
      .then((response) => response.json())
      .then((data) =>
        Array.isArray(data)
          ? setItems(data)
          : setMessage(data.message || "تعذر التحميل"),
      )
      .catch(() => setMessage("تعذر التحميل"));

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "الكل" || item.category === category) &&
          (status === "all" || (status === "active") === Boolean(item.active)) &&
          (featured === "all" || (featured === "yes") === Boolean(item.featured)) &&
          `${item.titleAr} ${item.title} ${item.slug}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [items, search, category, status, featured],
  );

  const update = async (item: Exhibition, values: Partial<Exhibition>) => {
    const previous = items;
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, ...values } : entry,
      ),
    );

    const response = await fetch(`/api/exhibitions/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, ...values }),
    });

    if (!response.ok) {
      const data = await response.json();
      setItems(previous);
      setMessage(data.message || "تعذر تحديث المعرض");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا المعرض؟")) return;
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));

    const response = await fetch(`/api/exhibitions/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setItems(previous);
      setMessage("تعذر حذف المعرض");
    }
  };

  const duplicate = async (item: Exhibition) => {
    const copy = { ...item } as Record<string, unknown>;
    delete copy.id;
    delete copy.createdAt;
    delete copy.updatedAt;
    const response = await fetch("/api/exhibitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...copy,
        slug: `${item.slug}-copy-${Date.now()}`,
        titleAr: `${item.titleAr} (نسخة)`,
      }),
    });
    if (response.ok) load();
    else {
      const data = await response.json();
      setMessage(data.message || "تعذر النسخ");
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white p-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black">تنظيم المعارض</h1>
          <p className="mt-1 text-sm text-slate-600">إدارة المعارض والفعاليات وتجهيزاتها</p>
        </div>
        <Link href="/admin/exhibitions/new" className="rounded-2xl bg-amber-400 px-5 py-3 text-center text-sm font-black text-slate-900">
          + إضافة معرض
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث عن معرض..." className="rounded-xl border p-3 text-xs" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border p-3 text-xs">{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border p-3 text-xs"><option value="all">كل الحالات</option><option value="active">فعال</option><option value="inactive">غير فعال</option></select>
        <select value={featured} onChange={(event) => setFeatured(event.target.value)} className="rounded-xl border p-3 text-xs"><option value="all">كل المعارض</option><option value="yes">مميزة</option><option value="no">غير مميزة</option></select>
      </div>

      {message && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600">{message}</p>}
      <div className="overflow-x-auto rounded-3xl border bg-white">
        <table className="min-w-[900px] w-full text-right text-xs">
          <thead className="bg-slate-50"><tr>{["الصورة", "اسم المعرض", "التصنيف", "الحالة", "مميز", "الرئيسية", "الترتيب", "الإجراءات"].map((heading) => <th key={heading} className="p-4 font-black">{heading}</th>)}</tr></thead>
          <tbody className="divide-y">{shown.map((item) => <tr key={item.id}>
            <td className="p-3"><img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" /></td>
            <td className="p-3 font-black">{item.titleAr}<span className="mt-1 block font-mono text-[10px] font-normal text-slate-400">/{item.slug}</span></td>
            <td className="p-3">{item.categoryAr || item.category}</td>
            <td className="p-3"><button onClick={() => update(item, { active: !item.active })} className={`rounded-full px-2 py-1 font-bold ${item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>{item.active ? "فعال" : "معطل"}</button></td>
            <td className="p-3"><input type="checkbox" checked={Boolean(item.featured)} onChange={(event) => update(item, { featured: event.target.checked })} /></td>
            <td className="p-3"><input type="checkbox" checked={Boolean(item.showOnHomepage)} onChange={(event) => update(item, { showOnHomepage: event.target.checked })} /></td>
            <td className="p-3"><input type="number" value={item.sortOrder || 0} onChange={(event) => update(item, { sortOrder: Number(event.target.value) || 0 })} className="w-14 rounded border p-1" /></td>
            <td className="p-3"><div className="flex gap-2"><Link href={`/admin/exhibitions/edit/${item.id}`} className="text-brand-blue">تعديل</Link><button onClick={() => duplicate(item)} className="text-amber-700">نسخ</button><button onClick={() => remove(item.id)} className="text-rose-600">حذف</button></div></td>
          </tr>)}{!shown.length && <tr><td colSpan={8} className="p-12 text-center text-slate-500">لم تتم إضافة أي معارض بعد</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
