"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ImageMedia, Product, Service } from "@/types";
import { MediaManager } from "@/components/media/MediaManager";

const categories = ["تصميم وإبداع", "Branding", "التسويق الرقمي", "السوشيال ميديا", "الإعلانات الخارجية", "الطباعة", "التصوير والإنتاج", "تطوير المواقع", "الهدايا الدعائية", "خدمات الشركات"];
const empty: Partial<Service> = { title: "", titleAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "", shortDescriptionAr: "", image: "", gallery: [], icon: "", category: categories[0], priceLabel: "", sortOrder: 0, active: true, featured: false, showInHero: false, showOnHomepage: false, relatedProductIds: [] };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function initialImages(service?: Service): ImageMedia[] {
  if (service?.images?.length) return service.images;
  return [...new Set([service?.coverImage || service?.image, ...(service?.gallery || [])].filter((url): url is string => Boolean(url)))]
    .map((url, sortOrder) => ({ url, sortOrder, alt: "" }));
}

export function ServiceForm({ initial, id }: { initial?: Service; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Service>>(() => ({
    ...(initial || empty),
    images: initialImages(initial),
    videos: initial?.videos || [],
    coverImage: initial?.coverImage || initial?.image || initialImages(initial)[0]?.url || "",
  }));
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("تعذر تحميل المنتجات المرتبطة");
        setProducts(await response.json());
      })
      .catch(() => setError("تعذر تحميل قائمة المنتجات المرتبطة."));
  }, []);

  const update = (key: keyof Service, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));
  const images = form.images || [];
  const videos = form.videos || [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const slug = form.slug?.trim() || slugify(form.title || "");
    if (!slug || !form.titleAr?.trim() || !form.descriptionAr?.trim()) {
      setError("اسم الخدمة والوصف العربي وSlug حقول مطلوبة.");
      return;
    }
    setSaving(true);
    try {
      const coverImage = images.some((image) => image.url === form.coverImage) ? form.coverImage : images[0]?.url || "";
      const response = await fetch(id ? `/api/services/${id}` : "/api/services", {
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
          price: form.price === undefined || form.price === null ? undefined : Number(form.price),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "تعذر حفظ الخدمة");
      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ الخدمة");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} dir="rtl" className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="الاسم العربي *" value={form.titleAr || ""} onChange={(value) => update("titleAr", value)} />
        <Field label="English Name" value={form.title || ""} onChange={(value) => update("title", value)} />
        <Field label="Slug" value={form.slug || ""} onChange={(value) => update("slug", slugify(value))} placeholder="branding" />
        <label className="block text-xs font-bold text-slate-700">التصنيف<select value={form.category || ""} onChange={(event) => update("category", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextArea label="الوصف العربي *" value={form.descriptionAr || ""} onChange={(value) => update("descriptionAr", value)} />
        <TextArea label="English Description" value={form.description || ""} onChange={(value) => update("description", value)} />
        <TextArea label="الوصف المختصر العربي" value={form.shortDescriptionAr || ""} onChange={(value) => update("shortDescriptionAr", value)} />
        <TextArea label="English Short Description" value={form.shortDescription || ""} onChange={(value) => update("shortDescription", value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="الأيقونة" value={form.icon || ""} onChange={(value) => update("icon", value)} />
        <Field label="تسمية السعر" value={form.priceLabel || ""} onChange={(value) => update("priceLabel", value)} placeholder="يبدأ من / اطلب عرض سعر" />
        <label className="block text-xs font-bold text-slate-700">السعر (اختياري)<input type="number" min="0" value={form.price ?? ""} onChange={(event) => update("price", event.target.value === "" ? undefined : Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 p-3" /></label>
        <label className="block text-xs font-bold text-slate-700">ترتيب الظهور<input type="number" value={form.sortOrder || 0} onChange={(event) => update("sortOrder", Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 p-3" /></label>
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

      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="mb-3 text-xs font-black text-slate-800">إعدادات النشر</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([["active", "نشطة"], ["featured", "مميزة"], ["showInHero", "عرض في Hero"], ["showOnHomepage", "عرض في الرئيسية"]] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={Boolean(form[key])} onChange={(event) => update(key, event.target.checked)} />{label}</label>)}</div>
      </div>

      <div>
        <p className="mb-3 text-xs font-black text-slate-800">منتجات مرتبطة (اختيارية)</p>
        <div className="grid max-h-48 grid-cols-1 gap-2 overflow-auto sm:grid-cols-2">{products.map((product) => <label key={product.id} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 text-xs"><input type="checkbox" checked={form.relatedProductIds?.includes(product.id)} onChange={(event) => update("relatedProductIds", event.target.checked ? [...(form.relatedProductIds || []), product.id] : form.relatedProductIds?.filter((item) => item !== product.id))} />{product.nameAr || product.name}</label>)}</div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">{error}</p>}
      <div className="flex gap-3"><button disabled={saving} className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-900 disabled:opacity-50">{saving ? "جاري الحفظ..." : "حفظ الخدمة"}</button><button type="button" onClick={() => router.push("/admin/services")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">إلغاء</button></div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block text-xs font-bold text-slate-700">{label}<input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-amber-400" /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-bold text-slate-700">{label}<textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-amber-400" /></label>;
}
