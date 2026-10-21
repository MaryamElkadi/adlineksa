'use client';

import React, { useState } from 'react';
import { Input } from '@/components/forms/Input';

export default function AdminMarketingPage() {
  const [coupons, setCoupons] = useState([
    { code: 'ADLINE10', discount: 'خصم 10%', usages: 142, status: 'نشط' },
    { code: 'WELCOME2026', discount: 'خصم 15%', usages: 89, status: 'نشط' },
    { code: 'BULKPRINT', discount: 'خصم 20%', usages: 34, status: 'نشط' },
  ]);

  const [newCode, setNewCode] = useState('');
  const [newDisc, setNewDisc] = useState('خصم 10%');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setCoupons([
      ...coupons,
      { code: newCode.toUpperCase(), discount: newDisc, usages: 0, status: 'نشط' },
    ]);
    setNewCode('');
  };

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* Cheerful Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <div>
          <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
            🏷️ التسويق والعروض الترويجية
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">أكواد وكوبونات الخصم</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            إنشاء كوبونات الخصم، عروض الكميات، وحملات إعادة استهداف السلات المتروكة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Coupon Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>✨</span> إنشاء كود خصم جديد
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">كود الكوبون</label>
              <Input
                placeholder="مثال: SUMMER25"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-800 rounded-2xl focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-xs font-mono font-bold uppercase shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1.5">قيمة الخصم</label>
              <Input
                placeholder="مثال: خصم 25% أو 50 ر.س"
                value={newDisc}
                onChange={(e) => setNewDisc(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-800 rounded-2xl focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-xs font-bold shadow-2xs"
              />
            </div>

            <button
              type="submit"
              className="w-full text-slate-900 bg-amber-400 hover:bg-amber-300 font-black text-xs py-3 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer mt-2"
            >
              + إنشاء الكوبون الآن ✨
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>🔥</span> الكوبونات الفعالة حالياً
          </h2>
          <div className="space-y-3">
            {coupons.map((cp, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gradient-to-r from-slate-50 to-amber-50/20 border border-slate-200/80 rounded-2xl p-4 hover:border-amber-300 transition-all shadow-2xs"
              >
                <div>
                  <span className="font-mono font-black text-slate-800 text-sm block tracking-wider">
                    {cp.code}
                  </span>
                  <span className="text-xs text-amber-700 font-extrabold mt-0.5 block">
                    {cp.discount}
                  </span>
                </div>
                <div className="text-left">
                  <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-xl">
                    ● {cp.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold block mt-1">
                    استُخدم {cp.usages} مرة
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}