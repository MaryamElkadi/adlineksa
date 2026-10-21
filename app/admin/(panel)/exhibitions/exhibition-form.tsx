"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Exhibition, ImageMedia, Product, Service } from "@/types";
import { MediaManager } from "@/components/media/MediaManager";

const categories = ["تنظيم المعارض", "تصميم وتجهيز الأجنحة", "تجهيز الفعاليات", "المؤتمرات", "المعارض التجارية", "المعارض الخاصة", "الفعاليات المؤسسية", "إطلاق المنتجات", "تجهيز المساحات", "الديكور والهوية البصرية"];
const blank: Partial<Exhibition> = { title: "", titleAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "", shortDescriptionAr: "", image: "", gallery: [], images: [], videos: [], coverImage: "", category: categories[0], categoryAr: categories[0], location: "", locationAr: "", priceLabel: "", features: [], featuresAr: [], services: [], servicesAr: [], relatedProductIds: [], relatedServiceIds: [], active: true, featured: false, showOnHomepage: false, sortOrder: 0 };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function initialImages(item?: Exhibition): ImageMedia[] {
  if (item?.images?.length) return item.images;
  return [...new Set([item?.coverImage || item?.image, ...(item?.gallery || [])].filter((url): url is string => Boolean(url)))]
    .map((url, sortOrder) => ({ url, sortOrder, alt: "" }));
}

export function ExhibitionForm({ initial, id }: { initial?: Exhibition; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Exhibition>>(() => ({
    ...(initial || blank),
    images: initialImages(initial),
    videos: initial?.videos || [],
    coverImage: initial?.coverImage || initial?.image || initialImages(initial)[0]?.url || "",
  }));
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const images = form.images || [];
  const videos = form.videos || [];

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then(async (response) => {
        if (!response.ok) throw new Error("تعذر تحميل المنتجات");
        return response.json();
      }),
      fetch("/api/services").then(async (response) => {
        if (!response.ok) throw new Error("تعذر تحميل الخدمات");
        return response.json();
      }),
    ]).then(([productList, serviceList]) => {
      setProducts(productList);
      setServices(serviceList);
    }).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "تعذر تحميل القوائم المرتبطة.");
    });
  }, []);

  const update = (key: keyof Exhibition, value: unknown) => setForm((previous) => ({ ...previous, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const slug = form.slug?.trim() || slugify(form.title || "");
    const coverImage = images.some((image) => image.url === form.coverImage) ? form.coverImage : images[0]?.url || "";
    if (!form.titleAr?.trim() || !form.descriptionAr?.trim() || !slug || !coverImage) {
      setError("الاسم العربي والوصف وصورة الغلاف وSlug حقول مطلوبة.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(id ? `/api/exhibitions/${id}` : "/api/exhibitions", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          image: coverImage,
          coverImage,
          images: images.map((image, sortOrder) => ({ ...image, sortOrder })),
          gallery: images.filter((image) => image.url !== coverImage).map((image) => image.url),
          videos,
          price: form.price === undefined ? undefined : Number(form.price),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "تعذر حفظ المعرض");
      router.push("/admin/exhibitions");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ المعرض");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} dir="rtl" className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="اسم المعرض *" value={form.titleAr || ""} onChange={(value) => update("titleAr", value)} />
        <Field label="English Title" value={form.title || ""} onChange={(value) => update("title", value)} />
        <Field label="Slug *" value={form.slug || ""} onChange={(value) => update("slug", slugify(value))} />
        <Select label="التصنيف" value={form.category || categories[0]} values={categories} onChange={(value) => { update("category", value); update("categoryAr", value); }} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Area label="الوصف المختصر العربي" value={form.shortDescriptionAr || ""} onChange={(value) => update("shortDescriptionAr", value)} />
        <Area label="English Short Description" value={form.shortDescription || ""} onChange={(value) => update("shortDescription", value)} />
        <Area label="الوصف الكامل العربي *" value={form.descriptionAr || ""} onChange={(value) => update("descriptionAr", value)} />
        <Area label="English Description" value={form.description || ""} onChange={(value) => update("description", value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="الموقع" value={form.locationAr || ""} onChange={(value) => update("locationAr", value)} />
        <Field label="English Location" value={form.location || ""} onChange={(value) => update("location", value)} />
        <Field label="تاريخ البداية" type="date" value={dateValue(form.date)} onChange={(value) => update("date", value || undefined)} />
        <Field label="تاريخ النهاية" type="date" value={dateValue(form.endDate)} onChange={(value) => update("endDate", value || undefined)} />
        <Field label="السعر" type="number" value={form.price?.toString() || ""} onChange={(value) => update("price", value ? Number(value) : undefined)} />
        <Field label="نص السعر" value={form.priceLabel || ""} onChange={(value) => update("priceLabel", value)} />
        <Field label="ترتيب الظهور" type="number" value={(form.sortOrder || 0).toString()} onChange={(value) => update("sortOrder", Number(value) || 0)} />
      </div>

      <MediaManager
        images={images}
        videos={videos}
        coverImage={form.coverImage || ""}
        onImagesChange={(nextImages) => setForm((previous) => ({
          ...previous,
          images: nextImages,
          coverImage: nextImages.some((image) => image.url === previous.coverImage) ? previous.coverImage : nextImages[0]?.url || "",
        }))}
        onVideosChange={(nextVideos) => update("videos", nextVideos)}
        onCoverImageChange={(coverImage) => update("coverImage", coverImage)}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ListEditor label="ميزات التجهيز بالعربية" values={form.featuresAr || []} onChange={(value) => update("featuresAr", value)} />
        <ListEditor label="Features in English" values={form.features || []} onChange={(value) => update("features", value)} />
        <ListEditor label="الخدمات المشمولة بالعربية" values={form.servicesAr || []} onChange={(value) => update("servicesAr", value)} />
        <ListEditor label="Included Services in English" values={form.services || []} onChange={(value) => update("services", value)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReferenceList title="خدمات مرتبطة" values={form.relatedServiceIds || []} items={services} label={(service) => service.titleAr || service.title} onChange={(value) => update("relatedServiceIds", value)} />
        <ReferenceList title="منتجات مرتبطة" values={form.relatedProductIds || []} items={products} label={(product) => product.nameAr || product.name} onChange={(value) => update("relatedProductIds", value)} />
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="mb-3 text-xs font-black">إعدادات النشر</p>
        <div className="flex flex-wrap gap-5">{([["active", "فعال"], ["featured", "مميز"], ["showOnHomepage", "عرض في الصفحة الرئيسية"]] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={Boolean(form[key])} onChange={(event) => update(key, event.target.checked)} />{label}</label>)}</div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">{error}</p>}
      <div className="flex gap-3"><button disabled={saving} className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 disabled:opacity-50">{saving ? "جاري الحفظ..." : "حفظ المعرض"}</button><button type="button" onClick={() => router.push("/admin/exhibitions")} className="rounded-xl border px-5 py-3 text-sm font-bold">إلغاء</button></div>
    </form>
  );
}

function dateValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-xs font-bold text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3" /></label>;
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-bold text-slate-700">{label}<textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3" /></label>;
}

function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <label className="block text-xs font-bold text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3">{values.map((item) => <option key={item}>{item}</option>)}</select></label>;
}

function ListEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (values: string[]) => void }) {
  return <section className="space-y-2 rounded-2xl border border-slate-200 p-4"><h2 className="text-sm font-black">{label}</h2>{values.map((value, index) => <div key={index} className="flex gap-2"><input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="min-w-0 flex-1 rounded-lg border border-slate-200 p-2 text-xs" /><button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="text-rose-600">×</button></div>)}<button type="button" onClick={() => onChange([...values, ""])} className="text-xs font-bold text-amber-700">+ إضافة</button></section>;
}

function ReferenceList<T extends Product | Service>({ title, values, items, label, onChange }: { title: string; values: string[]; items: T[]; label: (item: T) => string; onChange: (values: string[]) => void }) {
  return <section className="space-y-2 rounded-2xl border border-slate-200 p-4"><h2 className="text-sm font-black">{title}</h2><div className="max-h-56 space-y-2 overflow-auto">{items.map((item) => <label key={item.id} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs"><input type="checkbox" checked={values.includes(item.id)} onChange={(event) => onChange(event.target.checked ? [...values, item.id] : values.filter((id) => id !== item.id))} />{label(item)}</label>)}</div></section>;
}
