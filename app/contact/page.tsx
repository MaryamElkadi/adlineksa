'use client';

import React, { useState } from 'react';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-right">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-xs font-black text-amber-700 uppercase tracking-widest shadow-xs">
          ✨ التواصل والدعم المباشر
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue tracking-tight">
          نحن هنا لمساعدتك دائماً!
        </h1>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          هل لديك طلب مخصص بالجملة أو تحتاج إلى دعم فني للملفات والتصاميم؟ يسعدنا جداً تواصلك معنا!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Contact Info Card */}
        <div className="bg-gradient-to-br from-amber-50/80 via-sky-50/50 to-indigo-50/40 border border-amber-200/80 rounded-3xl p-8 space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-xl font-black text-brand-blue flex items-center gap-2">
            <span>📍</span> المقر الرئيسي لـ خط الإعلان السعودية
          </h2>

          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3.5 bg-white/80 rounded-2xl border border-amber-100 shadow-2xs">
              <span className="text-amber-600 font-black block text-sm mb-1">🏢 المكتب الرئيسي:</span>
              <span className="text-slate-600">طريق الملك فهد الصناعي، الملز، الرياض، المملكة العربية السعودية</span>
            </div>

            <div className="p-3.5 bg-white/80 rounded-2xl border border-sky-100 shadow-2xs">
              <span className="text-sky-600 font-black block text-sm mb-1">📞 الرقم الموحد:</span>
              <span dir="ltr" className="inline-block text-slate-600">12345 9200 966+ / +966 11 456 7890</span>
            </div>

            <div className="p-3.5 bg-white/80 rounded-2xl border border-emerald-100 shadow-2xs">
              <span className="text-emerald-600 font-black block text-sm mb-1">💬 مبيعات الواتساب:</span>
              <span dir="ltr" className="inline-block text-slate-600">4567 123 50 966+</span>
            </div>

            <div className="p-3.5 bg-white/80 rounded-2xl border border-indigo-100 shadow-2xs">
              <span className="text-indigo-600 font-black block text-sm mb-1">✉️ البريد الإلكتروني للدعم:</span>
              <span className="text-slate-600">support@adlineksa.com</span>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-black text-brand-blue">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-sm mx-auto">
                شكرًا لتواصلك معنا. سيتولى فريق الدعم مراجعة طلبك والرد عليك خلال أقل من ساعتي عمل.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-5"
            >
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-2xl font-black text-brand-blue">أرسل لنا رسالة 💌</h2>
                <p className="text-xs text-slate-500 font-medium">امتلئ النموذج وسنتواصل معك فوراً</p>
              </div>

              <Input label="الاسم الكامل" placeholder="اكتب اسمك هنا" required />
              <Input label="البريد الإلكتروني" type="email" placeholder="name@company.com" required />
              <Input label="رقم الجوال" placeholder="XXXX XXX 5X 966+" required />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 tracking-wide">
                  تفاصيل الرسالة / متطلبات الطباعة
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اصف احتياجات الطباعة المخصصة الخاصة بك..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 transition-all font-medium"
                />
              </div>

              {/* Cheerful Glowing Yellow Button */}
              <Button 
                type="submit" 
                variant="yellow" 
                className="w-full font-black text-base py-3.5 !text-slate-800 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md hover:shadow-lg border-0"
              >
                إرسال الاستفسار الآن 🚀
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}