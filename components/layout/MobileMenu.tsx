'use client';

import React from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative mr-auto w-4/5 max-w-sm h-full bg-white border-r border-slate-200 p-6 flex flex-col justify-between z-10 shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <span className="text-lg font-black text-brand-blue">
              ADLINE <span className="text-amber-500">KSA</span>
            </span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 p-2 rounded-lg"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-4 mt-6 text-base font-bold text-slate-800">
            <Link href="/" onClick={onClose} className="hover:text-brand-blue">
              الرئيسية
            </Link>
            <Link href="/categories" onClick={onClose} className="hover:text-brand-blue">
              فئات المنتجات
            </Link>
            <Link href="/products" onClick={onClose} className="hover:text-brand-blue">
              جميع المنتجات والمُهِّيئ
            </Link>
            <Link href="/cart" onClick={onClose} className="hover:text-brand-blue">
              سلة التسوق
            </Link>
            <Link href="/dashboard" onClick={onClose} className="hover:text-brand-blue">
              لوحة تحكم المستخدم
            </Link>
            <Link href="/admin/login" onClick={onClose} className="text-amber-600 font-extrabold hover:text-brand-blue">
              بوابة المشرف 🔐
            </Link>
            <Link href="/about" onClick={onClose} className="hover:text-brand-blue">
              من نحن
            </Link>
            <Link href="/contact" onClick={onClose} className="hover:text-brand-blue">
              اتصل بالدعم
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-200 text-xs font-bold text-brand-blue text-center">
          🇸🇦 شحن سريع لكافة أنحاء المملكة
        </div>
      </div>
    </div>
  );
};