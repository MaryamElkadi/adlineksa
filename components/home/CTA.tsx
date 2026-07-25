'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const CTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-brand-blue rounded-3xl p-10 lg:p-16 text-center overflow-hidden shadow-2xl">
          {/* Subtle Glow Circle */}
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              جاهز للطباعة؟
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-800 leading-tight">
              ابدأ مشروع الطباعة المخصص لك خلال ثوانٍ
            </h2>
            <p className="text-sm sm:text-base text-slate-800 max-w-xl font-medium">
              انضم إلى آلاف الشركات في جميع أنحاء المملكة العربية السعودية التي تعتمد على خط الإعلان لطباعة تجارية سريعة، خالية من الأخطاء، وبأسعار مناسبة.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" variant="yellow" className="text-slate-800 font-black">
                  ابدأ التخصيص الذكي →
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/40 text-slate-800 bg-white/90 hover:bg-white font-bold">
                  تحدث مع فريق المبيعات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};