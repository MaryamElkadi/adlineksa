"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
export default function AddCategoryPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    slug: "",
    image: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  console.log("🔥 HANDLE SUBMIT RUNNING");

  setLoading(true);


  try {
    let imageUrl = "";

    // 1. Upload image to Cloudinary (if selected)
    if (imageFile) {
      const data = new FormData();
      data.append("file", imageFile);
      data.append("upload_preset", "adline_upload");

      const upload = await fetch(
        "https://api.cloudinary.com/v1_1/xndjsijd/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const uploaded = await upload.json();

      if (!upload.ok) {
        throw new Error(uploaded.error?.message || "فشل رفع الصورة إلى Cloudinary");
      }

      imageUrl = uploaded.secure_url;
    }

    // 2. Create category object
    const category = {
      ...form,
      image: imageUrl,
    };

    // 3. Save category in MongoDB via Next.js API
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });

    const data = await res.json();

    if (res.ok) {
      // Success Alert
      await Swal.fire({
        icon: "success",
        title: "🎉 تمت الإضافة!",
        html: `<p style="font-size:16px">تم حفظ التصنيف بنجاح في قاعدة البيانات.</p>`,
        showConfirmButton: true,
        confirmButtonText: "ممتاز 🤍",
        confirmButtonColor: "#fbbf24",
        timer: 2500,
        timerProgressBar: true,
      });

      // Redirect and refresh cache
      router.push("/admin/categories");
      router.refresh();
    } else {
      // API Error Alert
      await Swal.fire({
        icon: "error",
        title: "خطأ أثناء الحفظ",
        text: data.message || "حدث خطأ غير متوقع أثناء حفظ التصنيف.",
        confirmButtonColor: "#f43f5e",
      });
    }
  } catch (err: any) {
    console.error("Submission Error:", err);
    // Upload / Network Error Alert
    await Swal.fire({
      icon: "error",
      title: "حدث خطأ!",
      text: err.message || "تعذر الاتصال بالسيرفر أو رفع الصورة.",
      confirmButtonColor: "#f43f5e",
    });
  } finally {
    setLoading(false);
  }
}

  return (
    <div dir="rtl" className="max-w-3xl mx-auto p-6 space-y-6 text-right font-sans">
      {/* Cheerful Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
          ✨ تصنيف جديد
        </span>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">إضافة تصنيف جديد للمتجر</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5">
          أدخلي تفاصيل التصنيف والاسم بالإنجليزي والعربي لتنظيم المنتجات بشكل مبهج ومميز
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
    <form
  onSubmit={(e) => {
    console.log("FORM SUBMITTED");
    handleSubmit(e);
  }}
>
          {/* Category Name (EN) */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1.5">
              اسم التصنيف (بالإنجليزي) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="مثال: T-Shirts & Apparel"
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3.5 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-xs font-bold outline-none shadow-2xs"
            />
          </div>

          {/* Category Name (AR) */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1.5">
              اسم التصنيف (بالعربي) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nameAr"
              value={form.nameAr}
              onChange={handleChange}
              placeholder="مثال: الملابس والملصقات"
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3.5 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-xs font-bold outline-none shadow-2xs"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1.5">
              الرابط الدائم (Slug) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="مثال: t-shirts"
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3.5 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-xs font-mono font-bold outline-none shadow-2xs dir-ltr text-right"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1.5">
              رابط صورة التصنيف (URL)
            </label>
           <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    if (!e.target.files) return;

    setImageFile(e.target.files[0]);
  }}
/>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1.5">
              وصف التصنيف
            </label>
            <textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="اكتبي وصفاً مختصراً ومبهجاً للعملاء حول المنتجات المندرجة تحت هذا التصنيف..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3.5 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-xs font-medium outline-none shadow-2xs resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-400 font-black text-xs px-8 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                  جاري حفظ التصنيف...
                </>
              ) : (
                "حفظ ونشر التصنيف ✨"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}