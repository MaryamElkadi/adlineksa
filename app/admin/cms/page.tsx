'use client';

import React, { useState } from 'react';
import { Input } from '@/components/forms/Input';

export default function AdminCMSPage() {
  const [heroTitle, setHeroTitle] = useState('نعيد تعريف الطباعة المخصصة بأسعار فورية ودقيقة.');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* Cheerful Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <div>
          <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
            🎨 نظام إدارة المحتوى والبنرات
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">إدارة محتوى الموقع (CMS)</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            تعديل بنرات الصفحة الرئيسية، شريط الإعلانات، الأسئلة الشائعة والنصوص الترويجية المباشرة
          </p>
        </div>
      </div>

      {/* Hero Section Content Editor Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <span className="w-7 h-7 flex items-center justify-center bg-amber-100 text-amber-800 font-black text-xs rounded-xl">
            1
          </span>
          <h2 className="text-base font-black text-slate-800">
            محرر محتوى الواجهة الرئيسية (Hero Section)
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1.5">
              العنوان الرئيسي للبنر العلوي
            </label>
            <Input
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="أدخلي العنوان الرئيسي للواجهة..."
              className="bg-slate-50 border-slate-200 text-slate-800 rounded-2xl focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-xs font-bold shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
              {saved ? '✓ تم تحديث بنر الصفحة الرئيسية بنجاح!' : ''}
            </span>
            
            <button
              type="submit"
              className="text-slate-900 bg-amber-400 hover:bg-amber-300 font-black text-xs px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              نشر التعديلات للعملاء ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}