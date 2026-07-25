'use client';

import React from 'react';
import { TESTIMONIALS } from '@/lib/constants';
import { Card } from '@/components/ui/Card';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            تقييمات موثقة
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-blue">
            محل ثقة كبرى العلامات التجارية في السعودية
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((rev) => (
            <Card key={rev.id} className="flex flex-col justify-between gap-4 border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                  {'★'.repeat(rev.rating)}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400"
                />
                <div>
                  <h4 className="text-xs font-bold text-brand-blue">{rev.author}</h4>
                  {rev.verifiedPurchase && (
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      ✓ مشتري موثق
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};