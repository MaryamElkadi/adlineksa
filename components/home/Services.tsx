'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export const Services: React.FC = () => {
  const services = [
    {
      icon: '⚡',
      title: 'تسعير ديناميكي ذكي',
      description: 'حساب فوري للأسعار لأي خامة، مقاسات، أو طبقات تغليف مباشرة وبدون أي تأخير.',
    },
    {
      icon: '🔍',
      title: 'اعتماد المعاينة الرقمية',
      description: 'مراجعة نموذج التجهيز المطبوع إلكترونياً مع فحص هوامش الأمان وهامش القص ثلاثي الأبعاد قبل بدء الإنتاج.',
    },
    {
      icon: '🚀',
      title: 'شحن سريع داخل المملكة',
      description: 'توصيل حتى باب موقعك في الرياض، جدة، الدمام، وجميع مناطق المملكة مع ميزة التتبع المباشر عبر الرسائل.',
    },
    {
      icon: '💎',
      title: 'خامات ورق فاخرة وصديقة للبيئة',
      description: 'اختر من بين القطن 400 جرام، السلوفان المخملي الناعم، البصمة الحرارية اللامعة، وأوراق الكرافت البيئية.',
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            لماذا تختار خط الإعلان السعودية
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-blue">
            مصممة خصيصاً للشركات والمصممين
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => (
            <Card key={idx} className="flex flex-col gap-3 border-slate-200">
              <div className="text-4xl mb-1">{srv.icon}</div>
              <h3 className="text-base font-bold text-brand-blue">{srv.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{srv.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};