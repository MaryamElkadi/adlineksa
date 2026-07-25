'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on admin/login, render children directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const [role, setRole] = useState<'Super Admin' | 'Manager' | 'Production' | 'Support'>('Super Admin');

  const navItems = [
    { href: '/admin/categories', label: '📂 الفئات' },
    { href: '/admin', label: '📊 نظرة عامة علي اللوحة' },
    { href: '/admin/products', label: '📦 كتالوج المنتجات (إدارة المنتجات)' },
    { href: '/admin/orders', label: '📑 إدارة الطلبات' },
    { href: '/admin/customers', label: '👥 ملفات العملاء' },
    { href: '/admin/cms', label: '🌐 إدارة المحتوى والبنرات' },
    { href: '/admin/marketing', label: '🏷️ التسويق وكوبونات الخصم' },
    { href: '/admin/settings', label: '⚙️ إعدادات المنصة' },
    { href: '/admin/quotations', label: '⚙️ طلبات التسعير ' },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-right font-sans">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-100 text-slate-800 p-6 flex flex-col justify-between space-y-6 flex-shrink-0 border-l border-slate-200 shadow-sm relative overflow-hidden">
        {/* Background Decorative Gradient Light */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6 relative">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 font-black flex items-center justify-center text-lg shadow-sm">
                أ
              </div>
              <div>
                <span className="font-black text-sm text-slate-800 block leading-tight">إدارة خط الإعلان</span>
                <span className="text-[10px] text-amber-700 font-bold block mt-0.5">لوحة التحكم المطورة</span>
              </div>
            </Link>
          </div>

          {/* Role Selector Badge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">الصلاحية الحالية:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-transparent text-slate-800 font-black focus:outline-none w-full cursor-pointer text-xs"
            >
              <option value="Super Admin" className="bg-white text-slate-800">مدير عام (جميع الصلاحيات)</option>
              <option value="Manager" className="bg-white text-slate-800">مدير فرعي</option>
              <option value="Production" className="bg-white text-slate-800">فريق الإنتاج والطباعة</option>
              <option value="Support" className="bg-white text-slate-800">مختص الدعم الفني</option>
            </select>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 text-xs font-bold">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-900 shadow-sm font-black'
                      : 'text-slate-800 hover:bg-amber-100/60 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer & Logout */}
        <div className="pt-4 border-t border-slate-200 text-xs space-y-3 relative">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
            <span>تم الدخول بـ:</span>
            <span className="font-black text-slate-800">المدير العام</span>
          </div>
          <Link
            href="/"
            className="block text-center py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-amber-400 hover:text-slate-900 hover:border-amber-400 transition-all shadow-2xs"
          >
            ← العودة لموقع العملاء
          </Link>
        </div>
      </aside>

      {/* Main Admin Body */}
      <main className="flex-grow p-6 lg:p-10 max-w-7xl mx-auto w-full bg-slate-50">{children}</main>
    </div>
  );
}
