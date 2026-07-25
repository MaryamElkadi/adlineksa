'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export default function AdminSettingsPage() {
  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* Cheerful Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <div>
          <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
            ⚙️ إعدادات لوحة التحكم والمتجر
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">إعدادات النظام والمنصة</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            ضبط خيارات المتجر، نسبة الضريبة، تكاليف الشحن السريع، وحسابات المسؤولين
          </p>
        </div>
      </div>

      {/* Credentials Banner (Cheerful Light Theme) */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-amber-50/20 border border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-3">
        <span className="text-xs font-black text-amber-800 uppercase tracking-wider block flex items-center gap-1.5">
          <span>🔐</span> بيانات تسجيل دخول المسؤول (Admin Credentials)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-white/80 border border-amber-200/70 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold mb-1">
              اسم المستخدم / البريد الإلكتروني:
            </span>
            <span className="font-black text-slate-800 text-sm dir-ltr text-right block">
              admin@adlineksa.com
            </span>
          </div>
          <div className="bg-white/80 border border-amber-200/70 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold mb-1">
              كلمة المرور:
            </span>
            <span className="font-black text-amber-700 text-sm dir-ltr text-right block">
              Adline@2026
            </span>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax & Delivery Rates */}
        <Card hoverEffect={false} className="border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
          <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <span>🇸🇦</span> الضرائب ورسوم التوصيل (المملكة العربية السعودية)
          </h2>
          <div className="space-y-3.5 text-xs font-medium text-slate-700">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700">نسبة ضريبة القيمة المضافة (ZATCA):</span>
              <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                15.0%
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700">رسوم التوصيل القياسي داخل السعودية:</span>
              <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                35 ر.س
              </span>
            </div>
            <div className="flex justify-between items-center bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-800">الحد الأدنى للشحن المجاني:</span>
              <span className="font-black text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                300 ر.س
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Gateways Integration */}
        <Card hoverEffect={false} className="border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
          <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <span>💳</span> بوابات الدفع الإلكتروني المربوطة
          </h2>
          <div className="space-y-3.5 text-xs font-medium text-slate-700">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800">بطاقات مدى البنكية (Mada)</span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-xl">
                مفعل ✓
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800">أبل باي (Apple Pay / iOS)</span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-xl">
                مفعل ✓
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-800">إس تي سي باي (STC Pay)</span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-xl">
                مفعل ✓
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}