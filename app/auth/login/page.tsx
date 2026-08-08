'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { api } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const res = await api.login({
        email,
        password,
      });
      
 localStorage.setItem("user", JSON.stringify(res.user));
if (res.user.role === "admin") {
    router.push("/admin");
} else {
    router.push("/dashboard");
}

router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50 flex items-center justify-center px-5"
    >
      {/* Background Blur */}

      <div className="absolute w-96 h-96 bg-blue-300/30 rounded-full blur-3xl -top-20 -right-20" />

      <div className="absolute w-80 h-80 bg-amber-300/30 rounded-full blur-3xl -bottom-16 -left-10" />

      {/* Login Card */}

      <div className="relative w-full max-w-md rounded-[32px] border border-white/50 bg-white/40 backdrop-blur-2xl shadow-2xl p-8">

        {/* Logo */}

        <div className="flex flex-col items-center">

          <Image
            src="/LOGO.jpeg"
            alt="Adline"
            width={90}
            height={90}
            className="rounded-3xl shadow-lg"
            priority
          />

          <h1 className="mt-6 text-4xl font-black text-brand-blue">
            Login
          </h1>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 mt-8"
        >

          {/* Email */}

          <div>

            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-blue-200 bg-blue-50 py-4 pr-4 pl-12 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* Password */}

          <div>

            <label className="block text-sm font-bold text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-blue-200 bg-blue-50 py-4 pr-12 pl-4 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-blue"
              >
                {showPassword ? (
                  <EyeOff size={22} />
                ) : (
                  <Eye size={22} />
                )}
              </button>

            </div>

          </div>

          {error && (
            <div className="rounded-xl bg-red-100 border border-red-300 p-3 text-center text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-4 text-lg font-black text-slate-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Login'}
          </button>

        </form>

        {/* Bottom */}

        <div className="mt-8 text-center">

          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-brand-blue hover:text-amber-600"
          >
            Forgot Password?
          </Link>

          <div className="mt-5 text-slate-600">
            Don't have an account?
          </div>

          <Link
            href="/auth/signup"
            className="mt-2 inline-block font-black text-amber-600 hover:text-brand-blue transition"
          >
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}