'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export const Hero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'rollup' | 'box' | 'sticker'>('cards');
  const [qty, setQty] = useState(500);
  const [finish, setFinish] = useState('Velvet Soft-Touch + Gold Foil');

  const previews = {
    cards: {
      name: 'Luxury Business Cards',
      nameAr: 'كروت شخصية فاخرة',
      base: 120,
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      badge: 'Bestseller',
    },
    rollup: {
      name: 'Deluxe Roll Up Stand',
      nameAr: 'رول أب ستاند فاخر',
      base: 195,
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
      badge: 'Popular',
    },
    box: {
      name: 'Custom Product Packaging Box',
      nameAr: 'صناديق تغليف مخصصة',
      base: 250,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
      badge: 'Enterprise',
    },
    sticker: {
      name: 'Die-Cut Vinyl Stickers',
      nameAr: 'ملصقات ستيكر مخصصة',
      base: 80,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      badge: 'New',
    },
  };

  const activeProduct = previews[activeTab];

  // Dynamic hero price calculation
  const calculatedPrice = Math.round(
    (activeProduct.base / 100) * qty * (finish.includes('Foil') ? 1.3 : 1.1)
  );

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
      {/* Animated Glow Backdrops */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none animate-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-400/60 text-slate-900 text-xs font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-brand-blue font-black">  منصة الطباعة الرقمية الحديثة في المملكة العربية السعودية
</span>
            </div>

           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-heading tracking-tight leading-[1.2]">
  خط الاعلان تجربة الطباعة المخصصة
  <br />
  <span className="bg-gradient-to-r from-brand-primary via-blue-500 to-amber-400 bg-clip-text text-transparent">
    بأسعار فورية وحساب مباشر
  </span>
</h1>
            <p className="text-base sm:text-lg text-brand-body font-medium leading-loose max-w-2xl">
  استمتع بتجربة طباعة احترافية وسهلة. اختر مواصفات المنتج، استعرض المعاينة، واحصل على السعر فورًا، ثم أرسل طلبك خلال أقل من دقيقة مع توصيل سريع إلى جميع مناطق المملكة العربية السعودية.
</p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold text-slate-700">
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

            {/* Action Buttons */}
        {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" variant="yellow" className="w-full sm:w-auto text-slate-950 font-black">
                  ابدأ طلبك الآن →
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

            {/* Live Stats Bar */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-brand-blue">50,000+</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">طلب تم تسليمه</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500">99.8%</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">ضمان دقة الألوان</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-brand-blue">4.9 / 5.0</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">+500 تقييم موثق</div>
              </div>
            </div>
          </div>

          {/* Right Column: Printnes-Inspired Animated Live Interactive Configurator Preview */}
          <div className="lg:col-span-5 relative">
            {/* Animated Floating Chips */}
            <div className="absolute -top-4 -left-4 z-20 bg-white border border-amber-400 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-float">
              <span className="text-2xl">✨</span>
              <div>
                <div className="text-xs font-black text-brand-blue">Dynamic Pricing</div>
                <div className="text-[10px] text-slate-500">No waiting for quotes</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 z-20 bg-brand-blue text-white shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-float" style={{ animationDelay: '1.5s' }}>
              <span className="text-2xl">🇸🇦</span>
              <div>
                <div className="text-xs font-black text-amber-400">Express Delivery KSA</div>
                <div className="text-[10px] text-slate-300">Direct to your office</div>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 relative">
              {/* Category Selector Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                {(['cards', 'rollup', 'box', 'sticker'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`py-2 text-[11px] font-extrabold rounded-xl capitalize transition-all ${
                      activeTab === tabKey
                        ? 'bg-brand-blue text-yellow-600 shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>

              {/* Product Visual */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="yellow">{activeProduct.badge}</Badge>
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-2.5 flex justify-between items-center shadow-md">
                  <div>
                    <h4 className="text-xs font-black text-brand-blue">{activeProduct.name}</h4>
                    <p className="text-[10px] text-slate-500 font-arabic font-semibold">{activeProduct.nameAr}</p>
                  </div>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                    Live Demo
                  </span>
                </div>
              </div>

              {/* Live Interactive Config Controls */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Quantity Selector:</span>
                  <span className="font-black text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {qty} Units
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="100"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-bold text-slate-700">Finishing Option:</span>
                  <select
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className="text-xs font-bold text-brand-blue bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="Velvet Soft-Touch + Gold Foil">Velvet + Gold Foil</option>
                    <option value="Standard Matte">Standard Matte</option>
                    <option value="High Gloss UV">High Gloss UV</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Instant Price Box */}
              <div className="bg-gradient-to-r from-slate-900 to-brand-blue rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                    Estimated Quote
                  </span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatCurrency(calculatedPrice)}
                  </span>
                </div>
                <Link href={`/products?slug=${activeProduct.name.toLowerCase().includes('card') ? 'luxe-business-cards' : activeProduct.name.toLowerCase().includes('roll') ? 'deluxe-rollup-stand' : activeProduct.name.toLowerCase().includes('box') ? 'custom-packaging-box' : 'luxe-business-cards'}`}>
                  <Button size="sm" variant="yellow">
                    Customize Order →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
