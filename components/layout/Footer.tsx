'use client';

import React from 'react';
import Link from 'next/link';
import { ProductsQrCode } from './ProductsQrCode';

const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '966549362553').replace(/\D/g, '');

export const Footer: React.FC = () => {
  return (
    <footer dir="rtl" className="mt-20 border-t border-slate-200 bg-white pt-16 pb-12 text-right text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-200 pb-12 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3" aria-label="العودة إلى الصفحة الرئيسية">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-lg font-black text-amber-400 shadow-sm">
                A
              </div>
              <span className="text-xl font-black text-brand-blue">
                خط الإعلان <span className="text-amber-500">السعودية</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              المنصة الرائدة للطباعة الرقمية والإعلانات في المملكة العربية السعودية. جودة عالية للشركات، شحن سريع، وحساب فوري وذكّي للأسعار.
            </p>
            <div className="text-xs font-bold text-amber-600">📍 الدمام | الخبر</div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-brand-blue">
              أقسام الطباعة
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              {[
                'الكروت الشخصية والمطبوعات المكتبية',
                'الرول أب والبنرات الإعلانية',
                'الصناديق والتغليف المخصص',
                'الفلايرز والبروشورات',
                'ملصقات الاستيكر المخصصة',
              ].map((label) => (
                <li key={label}>
                  <Link href="/categories" className="transition-colors hover:text-brand-blue">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-brand-blue">
              العملاء والإدارة
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/account" className="transition-colors hover:text-brand-blue">
                  تسجيل الدخول / الحساب
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-brand-blue">
                  عن خط الإعلان السعودية
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-brand-blue">
                  تواصل مع فريق الدعم
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-brand-blue">
              خط الدعم المباشر
            </h4>
            <div className="space-y-2.5 text-xs font-medium">
              <p>
                📞 الهاتف: <a href="tel:+966549362553" dir="ltr" className="text-slate-600 hover:text-brand-blue">+966 54 936 2553</a>
              </p>
              <p>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدمات خط الإعلان.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-emerald-600"
                >
                  💬 واتساب: +966 54 936 2553
                </a>
              </p>
              <p>✉️ البريد الإلكتروني: sales@adlineksa.com</p>
              <p>🕒 أوقات العمل: الأحد - الخميس (8:00 صباحاً - 12:30 مساءً)</p>
            </div>
            <div className="mt-5 max-w-[13rem]">
              <ProductsQrCode />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} خط الإعلان السعودية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 font-semibold text-slate-600" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
