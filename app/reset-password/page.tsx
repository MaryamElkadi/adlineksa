'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-800">رابط مفقود أو غير صالح</h2>
        <p className="text-xs text-slate-500 font-medium">
          لم يتم العثور على رمز إعادة التعيين في هذا الرابط. يرجى طلب رابط جديد.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block py-3 px-6 rounded-2xl bg-amber-400 text-slate-900 font-black text-xs shadow-sm hover:bg-amber-500 transition-all"
        >
          طلب رابط جديد ←
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'تعذر إعادة تعيين كلمة المرور. قد يكون الرابط قد انتهت صلاحيته.');
      }
    } catch {
      setError('حدث خطأ أثناء التحديث. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {success ? (
        <div className="space-y-6 text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-black text-emerald-900">تم التغيير بنجاح!</h2>
            <p className="text-xs font-bold text-emerald-800">
              تم تحديث كلمة المرور الخاصة بحسابك بنجاح. يمكنك الآن تسجيل الدخول.
            </p>
          </div>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-md"
          >
            الانتقال لتسجيل الدخول ←
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-10 pl-10 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-10 pl-10 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800"
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
            {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور ←'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-slate-50 to-amber-100/60 flex items-center justify-center px-4 py-12 font-sans text-right"
    >
      <div className="absolute w-96 h-96 bg-amber-300/20 rounded-full blur-3xl -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-80 h-80 bg-sky-300/20 rounded-full blur-3xl -bottom-16 -left-10 pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
            🔒
          </div>
          <h1 className="text-2xl font-black text-slate-800">تغيير كلمة المرور</h1>
          <p className="text-xs text-slate-500 font-medium">
            أدخل كلمة المرور الجديدة الخاصة بحسابك أدناه.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-slate-400">جاري التحميل...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
