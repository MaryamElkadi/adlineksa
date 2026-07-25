'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('admin@adlineksa.com');
  const [password, setPassword] = useState('Adline@2026');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@adlineksa.com' && password === 'Adline@2026') {
      localStorage.setItem('adline_admin_authenticated', 'true');
      router.push('/admin');
    } else {
      setError('Invalid admin credentials. Use admin@adlineksa.com / Adline@2026');
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

        {/* Demo Credentials Alert Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs space-y-1">
          <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
            🔑 Admin Access Credentials:
          </div>
          <div className="text-slate-700 font-mono">
            <strong>Username:</strong> admin@adlineksa.com
          </div>
          <div className="text-slate-700 font-mono">
            <strong>Password:</strong> Adline@2026
          </div>
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
