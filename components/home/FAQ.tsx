import React from 'react';
import { FAQS } from '@/lib/constants';

export const FAQ: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            مركز الدعم
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-blue">
            الأسئلة الشائعة
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              <div className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-sm text-brand-blue">
                <span>{faq.question}</span>
                <span className="text-amber-500 text-lg font-black">+</span>
              </div>
              <div className="px-5 pb-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};