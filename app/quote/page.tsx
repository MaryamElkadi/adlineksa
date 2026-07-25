"use client";

import React, { useState } from "react";

export default function QuotationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: "",
    name: "",
    phone: "",
    email: "",
    city: "",
    category: "",
    quantity: "",
    width: "",
    height: "",
    material: "",
    deliveryDate: "",
    details: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
        return;
      }

      setSubmitted(true);
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-right font-sans"
    >
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-xs font-black text-amber-700 uppercase tracking-widest shadow-xs">
          🏢 خدمات ومبيعات الشركات (B2B)
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          طلب عرض سعر للمؤسسات والشركات
        </h1>
        <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
          احصل على تسعير مخصص للكميات التجارية شامل الفواتير الضريبية المعتمدة والتسليم في المواعيد المحددة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Side: B2B Features & Info Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-amber-50/80 via-sky-50/50 to-indigo-50/40 border border-amber-200/80 rounded-3xl p-8 space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>✨</span> مميزات خدمة الشركات
          </h2>

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
              <span className="text-amber-600 font-black block text-sm">
                ⚡ رد سريع وخاص:
              </span>
              <span className="text-slate-600">
                يتم مراجعة كافة المخططات والمواصفات وإصدار العروض خلال 24 ساعة عمل.
              </span>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-sky-100 shadow-2xs space-y-1">
              <span className="text-sky-600 font-black block text-sm">
                🧾 فواتير ضريبية معتمدة:
              </span>
              <span className="text-slate-600">
                نوفر كافة الأوراق الرسمية والمستندات المطلوبة للإدارات المالية.
              </span>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
              <span className="text-emerald-600 font-black block text-sm">
                🏷️ خصومات الكميات:
              </span>
              <span className="text-slate-600">
                أسعار تنافسية خاصة لطلبات المبيعات المجمعة وتجهيز الفعاليات والمعارض.
              </span>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-indigo-100 shadow-2xs space-y-1">
              <span className="text-indigo-600 font-black block text-sm">
                📞 استفسار مباشر؟
              </span>
              <span className="text-slate-600 block mb-1">تواصل مع قسم المشتريات:</span>
              <span dir="ltr" className="inline-block font-bold text-indigo-700 text-sm">
                +966 50 123 4567
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-black text-slate-900">
                تم استلام طلب التسعير بنجاح!
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-md mx-auto">
                شكرًا لثقتكم بخط الإعلان. سيتولى مسؤول مبيعات الشركات مراجعة مواصفات مشروعكم والتواصل معكم بعرض السعر المخصص قريباً.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
              >
                إرسال طلب تسعير آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Form Section Header */}
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-black text-slate-900">
                  نموذج مواصفات مشروعك 📝
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  يرجى تعبئة البيانات الفنية بدقة للحصول على تسعير شامل وواضح
                </p>
              </div>

              {/* Group 1: Company & Contact */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md inline-block">
                  1. بيانات المنشأة والمسؤول
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      اسم الشركة / الجهة *
                    </label>
                    <input
                      required
                      name="company"
                      placeholder="مثال: شركة خط الإعلان المحدودة"
                      value={form.company}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      اسم مسؤول المشتريات / الممُثل *
                    </label>
                    <input
                      required
                      name="name"
                      placeholder="الاسم الكامل"
                      value={form.name}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      رقم الجوال / الواتساب *
                    </label>
                    <input
                      required
                      name="phone"
                      placeholder="XXXX XXX 5X 966+"
                      value={form.phone}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      البريد الإلكتروني للعمل *
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      المدينة / موقع التسليم
                    </label>
                    <input
                      name="city"
                      placeholder="الرياض، جدة، الدمام..."
                      value={form.city}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Product & Specs */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-md inline-block">
                  2. مواصفات الطلب والكمية
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      تصنيف المنتج *
                    </label>
                    <select
                      required
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="light-input"
                    >
                      <option value="">اختر التصنيف</option>
                      <option>لافتات إعلانية وتجارية</option>
                      <option>ستاندات وتجهيز معارض</option>
                      <option>لوحات واجهات ومكاتب</option>
                      <option>ملصقات وستيكرات</option>
                      <option>تغليف وعلب منتجات</option>
                      <option>أكياس ورقية وقماشية</option>
                      <option>بروشورات ومطبوعات ورقية</option>
                      <option>مشروع مخصص / أخرى</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      الكمية المطلوبة *
                    </label>
                    <input
                      required
                      name="quantity"
                      placeholder="مثال: 500 قطعة"
                      value={form.quantity}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      العرض (سم)
                    </label>
                    <input
                      name="width"
                      placeholder="100"
                      value={form.width}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      الارتفاع (سم)
                    </label>
                    <input
                      name="height"
                      placeholder="200"
                      value={form.height}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      الخامة والسمك
                    </label>
                    <input
                      name="material"
                      placeholder="أكريليك، ايكوبوند، بنر..."
                      value={form.material}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      الموعد المستهدف للتسليم
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={form.deliveryDate}
                      onChange={handleChange}
                      className="light-input"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Details & Attachments */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ملاحظات وتفاصيل إضافية *
                  </label>
                  <textarea
                    rows={4}
                    required
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    placeholder="اشرح الملاحظات الفنية، طريقة التركيب، خيارات التشطيب (لامع/مطفأ)، أو تفاصيل أخرى..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 transition-all font-medium resize-none"
                  />
                </div>

                {/* Upload Section */}
                <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-6 text-center space-y-2">
                  <div className="text-3xl">📎</div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    إرفاق التصاميم أو المخططات الفنية
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    رفع ملفات PDF، الهوية البصرية، أو الرسومات للتحقق من الجودة.
                  </p>
                  <input
                    type="file"
                    multiple
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-200/60 file:text-amber-800 hover:file:bg-amber-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-black text-base py-4 text-slate-800 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md hover:shadow-lg border-0 cursor-pointer disabled:opacity-50"
              >
                {loading ? "جاري الإرسال..." : "إرسال طلب التسعير الآن 🚀"}
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .light-input {
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }

        .light-input:focus {
          outline: none;
          background-color: #ffffff;
          border-color: #fbbf24;
          box-shadow: 0 0 0 4px rgba(254, 243, 199, 0.8);
        }

        .light-input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}