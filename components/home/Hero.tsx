import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { HeroInteractivePreview } from './HeroInteractivePreview';
import { HeroFeaturedBanner, type HeroItem } from './HeroFeaturedBanner';

interface HeroProps {
  initialHeroItems?: HeroItem[];
  featuredSlot?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({ initialHeroItems = [], featuredSlot }) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
      {/* ANIMATED BACKGROUND GLOWS */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none animate-glow" />

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT COLUMN - INTERACTIVE PREVIEW CARD (CLIENT COMPONENT) */}
          <HeroInteractivePreview />

          {/* RIGHT COLUMN - CONTENT & STATS (SERVER-RENDERED) */}
          <div className="lg:col-span-7 space-y-6 text-right order-1 lg:order-2">
            {/* TOP BADGE SLOT */}
            {featuredSlot ?? (initialHeroItems.length > 0 ? <HeroFeaturedBanner items={initialHeroItems} /> : null)}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-400/60 text-slate-900 text-xs font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-brand-blue font-black">
                منصة الخدمات الاعلانية الرقمية الحديثة في المملكة العربية السعودية
              </span>
            </div>

            {/* MAIN HEADING */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-heading tracking-tight leading-[1.2]">
              خط الاعلان تجربة خدمات اعلانية متكاملة
              <br />
              <span className="bg-gradient-to-r from-brand-primary via-blue-500 to-amber-400 bg-clip-text text-transparent">
              بأسعار مناسبة وخدمة فورية
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-base sm:text-lg text-brand-body font-medium leading-loose max-w-2xl ms-auto">
              استمتع بتجربة طباعة احترافية وسهلة. اختر مواصفات المنتج،
              استعرض المعاينة، واحصل على السعر فورًا، ثم أرسل طلبك خلال
              أقل من دقيقة مع توصيل سريع إلى جميع مناطق المملكة العربية
              السعودية.
            </p>

            {/* FEATURE PILLS */}
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold text-slate-700 justify-start">
              <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                ⚡ تسعير فوري
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                🚚 شحن سريع خلال 48 ساعة
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
                🎨 مراجعة مجانية للتصميم
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-start">
              <Link href="/products">
                <Button
                  size="lg"
                  variant="yellow"
                  className="w-full sm:w-auto text-slate-950 font-black"
                >
                  ابدأ طلبك الآن ←
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto !text-slate-800 hover:!text-amber-300 font-bold border border-blue-400/30"
                >
                  تصفح جميع الأقسام
                </Button>
              </Link>
            </div>

            {/* STATS */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-brand-blue">
                  50,000+
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  طلب تم تسليمه
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500">
                  99.8%
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  ضمان دقة الألوان
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-brand-blue">
                  4.9 / 5.0
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  +500 تقييم موثق
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
