'use client';

import React, { useState } from 'react';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';

export default function AccountPage() {
  const [tab, setTab] = useState<'login' | 'otp'>('login');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  return (
    <div dir="rtl" className="max-w-md mx-auto px-4 py-16 text-right">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-100/80 space-y-6 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center relative space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[11px] font-black text-amber-800 uppercase tracking-widest shadow-2xs">
            مركز تسجيل الدخول ✨
          </span>
          <h1 className="text-2xl font-black text-brand-blue pt-2">
            مرحباً بك في خط الإعلان
          </h1>
          <p className="text-xs text-slate-500 font-medium">سجل دخولك لمتابعة طلباتك وإدارة حسابك</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border border-slate-200 rounded-2xl p-1 bg-slate-50/80">
          <button
            onClick={() => {
              setTab('login');
              setOtpSent(false);
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-brand-blue'
            }`}
          >
            البريد / كلمة المرور ✉️
          </button>
          <button
            onClick={() => setTab('otp')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              tab === 'otp'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-brand-blue'
            }`}
          >
            رمز الجوال 🇸🇦
          </button>
        </div>

        {/* Form Section */}
        {tab === 'login' ? (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <Input label="البريد الإلكتروني" type="email" placeholder="name@company.com" required />
            <Input label="كلمة المرور" type="password" placeholder="••••••••" required />
            <Button
              type="submit"
              variant="yellow"
              className="w-full font-black text-sm py-3.5 !text-slate-800 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md hover:shadow-lg border-0"
            >
              تسجيل الدخول ←
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpSent ? (
              <>
                <Input
                  label="رقم الجوال السعودي"
                  placeholder="XXXX XXX 5X 966+"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button
                  variant="yellow"
                  className="w-full font-black text-sm py-3.5 !text-slate-800 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md hover:shadow-lg border-0"
                  onClick={() => setOtpSent(true)}
                >
                  إرسال رمز التحقق 📩
                </Button>
              </>
            ) : (
              <>
                <Input label="أدخل الرمز المكون من 6 أرقام" placeholder="123456" />
                <Button
                  variant="yellow"
                  className="w-full font-black text-sm py-3.5 !text-slate-800 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md hover:shadow-lg border-0"
                  onClick={() => alert('تم تسجيل الدخول بنجاح!')}
                >
                  التحقق والمتابعة 🚀
                </Button>
              </>
            )}
          </div>
        )}

        {/* Social SSO Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            أو سجل الدخول عبر الدخول الموحد
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
              <span>🌐 Google</span>
            </button>
            <button className="py-2.5 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
              <span>🍎 Apple ID</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}