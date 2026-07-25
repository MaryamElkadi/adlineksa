'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer dir="rtl" className="bg-white border-t border-slate-200 text-slate-600 pt-16 pb-12 mt-20 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          {/* Company Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-amber-400 font-black text-lg shadow-sm">
                A
              </div>
              <span className="text-xl font-black text-brand-blue">
                خط الإعلان <span className="text-amber-500">السعودية</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              المنصة الرائدة للطباعة الرقمية والإعلانات في المملكة العربية السعودية. جودة عالية للشركات، شحن سريع، وحساب فوري وذكّي للأسعار.
            </p>
            <div className="text-xs text-amber-600 font-bold">
              📍 الرياض | جدة | الدمام | الخبر
            </div>
          </div>

          {/* Categories Links */}
          <div>
            <h4 className="text-xs font-black text-brand-blue uppercase tracking-wider mb-4">
              أقسام الطباعة
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/categories" className="hover:text-brand-blue transition-colors">
                  الكروت الشخصية والمطبوعات المكتبية
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-brand-blue transition-colors">
                  الرول أب والبنرات الإعلانية
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-brand-blue transition-colors">
                  الصناديق والتغليف المخصص
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-brand-blue transition-colors">
                  الفلايرز والبروشورات
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-brand-blue transition-colors">
                  ملصقات الاستيكر المخصصة
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-brand-blue uppercase tracking-wider mb-4">
              العملاء والإدارة
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/dashboard" className="hover:text-brand-blue transition-colors">
                  لوحة المستخدم والطلبات
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-brand-blue transition-colors">
                  تسجيل الدخول / الحساب
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-brand-blue text-amber-600 transition-colors">
                  بوابة لوحة التحكم والإدارة 🔐
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-blue transition-colors">
                  عن خط الإعلان السعودية
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-blue transition-colors">
                  تواصل مع فريق الدعم
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-black text-brand-blue uppercase tracking-wider mb-4">
              خط الدعم المباشر
            </h4>
            <div className="space-y-2.5 text-xs font-medium">
              <p>📞 الهاتف: 12345 9200 966+</p>
              <p>💬 واتساب: 4567 123 50 966+</p>
              <p>✉️ البريد الإلكتروني: support@adlineksa.com</p>
              <p>🕒 أوقات العمل: الأحد - الخميس (8:00 صباحاً - 6:00 مساءً)</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} خط الإعلان السعودية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <span>💳 مدى</span>
            <span>💳 فيزا</span>
            <span>💳 ماستركارد</span>
            <span>📱 أبل باي</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;