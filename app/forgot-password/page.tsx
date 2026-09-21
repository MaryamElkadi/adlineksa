'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || 'إذا كان البريد الإلكتروني مسجلاً لدينا، فسنرسل رابط إعادة تعيين كلمة المرور.');
      setSubmitted(true);
    } catch {
      setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-slate-50 to-amber-100/60 flex items-center justify-center px-4 py-12 font-sans text-right"
    >
      {/* Background Decorative Elements */}
      <div className="absolute w-96 h-96 bg-amber-300/20 rounded-full blur-3xl -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-80 h-80 bg-sky-300/20 rounded-full blur-3xl -bottom-16 -left-10 pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
            🔑
          </div>
          <h1 className="text-2xl font-black text-slate-800">نسيت كلمة المرور؟</h1>
          <p className="text-xs text-slate-500 font-medium">
            أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمن لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900 leading-relaxed">
                {message}
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
            >
              العودة لصفحة تسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-10 pl-4 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-slate-900 font-black text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين ←'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition-all"
              >
                <ArrowRight size={14} />
                العودة لصفحة تسجيل الدخول
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
