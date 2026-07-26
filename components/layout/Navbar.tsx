'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header dir="rtl" className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-amber-400 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-brand-blue">
                Adline <span className="text-amber-500">KSA</span>
              </span>
              <span className="text-[10px] text-slate-500 block font-arabic leading-none font-semibold">
                خط الإعلان للطباعة
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-700">
            <Link href="/" className="hover:text-brand-blue transition-colors">
              الرئيسية
            </Link>
            <Link href="/categories" className="hover:text-brand-blue transition-colors">
              الفئات
            </Link>
            <Link href="/products" className="hover:text-brand-blue transition-colors">
              المنتجات
            </Link>
            <Link href="/about" className="hover:text-brand-blue transition-colors">
              من نحن
            </Link>
            <Link href="/contact" className="hover:text-brand-blue transition-colors">
              اتصل بنا
            </Link>
            <Link href="/quote" className="hover:text-brand-blue transition-colors">
              طلب عرض سعر
            </Link>
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-brand-blue hover:border-amber-400 transition-all"
            >
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow-md animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-all"
            >
              👤 لوحة التحكم
            </Link>

            <Link
              href="/admin/login"
              className="hidden lg:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-400/20 text-amber-900 border border-amber-400/40 text-xs font-black hover:bg-amber-400/40 transition-all"
            >
              🔐 الإدارة
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-brand-blue"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};