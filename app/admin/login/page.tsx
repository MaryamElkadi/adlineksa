'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (data.user.role !== 'admin') {
          setError('هذا الحساب لا يملك صلاحيات مدير النظام.');
          return;
        }
        localStorage.setItem('adline_admin_authenticated', 'true');
        router.push('/admin');
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة.');
      }
    } catch {
      setError('حدث خطأ أثناء الاتصال بالخادم.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue text-amber-400 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            A
          </div>
          <h1 className="text-2xl font-black text-brand-blue">Admin Control Portal</h1>
          <p className="text-xs text-slate-500 font-medium">
            Adline KSA Redesign - Enterprise Admin Panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Admin Email / Username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}

          <Button type="submit" variant="yellow" className="w-full text-slate-950 font-black">
            Login to Admin Dashboard →
          </Button>
        </form>
      </div>
    </div>
  );
}
