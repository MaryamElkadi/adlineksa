'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  User
} from 'lucide-react';

import { api } from '@/services/api';

export default function SignupPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setError('');

    if (form.password !== form.confirmPassword) {
      return setError("Passwords don't match.");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {

      setLoading(true);

      const res = await api.signup({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      localStorage.setItem(
    "user",
    JSON.stringify(res.user)
);

      if (res.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {

      setError(err.message || 'Something went wrong');

    } finally {

      setLoading(false);

    }

  }

  return (

<div
dir="rtl"
className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50 flex items-center justify-center px-5 py-10"
>

<div className="absolute w-96 h-96 bg-blue-300/30 rounded-full blur-3xl -top-20 -right-20"/>

<div className="absolute w-80 h-80 bg-amber-300/30 rounded-full blur-3xl bottom-0 left-0"/>

<div className="w-full max-w-lg rounded-[32px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl p-8">

<div className="flex flex-col items-center">

<Image
src="/logo.jpeg"
alt="logo"
width={90}
height={90}
className="rounded-3xl shadow-lg"
/>

<h1 className="mt-5 text-4xl font-black text-brand-blue">

Create Account

</h1>

<p className="text-slate-500 mt-2">

Join Adline KSA

</p>

</div>

<form
onSubmit={handleSubmit}
className="space-y-5 mt-8"
>

<div className="grid grid-cols-2 gap-4">

<div>

<label className="font-bold text-slate-700 mb-2 block">

First Name

</label>

<div className="relative">

<User className="absolute left-4 top-4 text-slate-400"/>

<input
name="firstName"
value={form.firstName}
onChange={handleChange}
placeholder="First Name"
className="w-full rounded-2xl bg-blue-50 border border-blue-200 py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-100"
/>

</div>

</div>

<div>

<label className="font-bold text-slate-700 mb-2 block">

Last Name

</label>

<div className="relative">

<User className="absolute left-4 top-4 text-slate-400"/>

<input
name="lastName"
value={form.lastName}
onChange={handleChange}
placeholder="Last Name"
className="w-full rounded-2xl bg-blue-50 border border-blue-200 py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-100"
/>

</div>

</div>

</div>

<div>

<label className="font-bold text-slate-700 mb-2 block">

Email

</label>

<div className="relative">

<Mail className="absolute left-4 top-4 text-slate-400"/>

<input
type="email"
name="email"
value={form.email}
onChange={handleChange}
placeholder="example@email.com"
className="w-full rounded-2xl bg-blue-50 border border-blue-200 py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-100"
/>

</div>

</div>

<div>

<label className="font-bold text-slate-700 mb-2 block">

Phone

</label>

<div className="relative">

<Phone className="absolute left-4 top-4 text-slate-400"/>

<input
name="phone"
value={form.phone}
onChange={handleChange}
placeholder="+966..."
className="w-full rounded-2xl bg-blue-50 border border-blue-200 py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-100"
/>

</div>

</div>

<div>

<label className="font-bold text-slate-700 mb-2 block">

Password

</label>

<div className="relative">

<input
type={showPassword ? 'text' : 'password'}
name="password"
value={form.password}
onChange={handleChange}
placeholder="Password"
className="w-full rounded-2xl bg-blue-50 border border-blue-200 py-4 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-100"
/>

<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-4 top-4 text-slate-500"
>

{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}

</button>

</div>

</div>

<div>

<label className="font-bold text-slate-700 mb-2 block">

Confirm Password

</label>

<div className="relative">

<input
type={showConfirm ? 'text' : 'password'}
name="confirmPassword"
value={form.confirmPassword}
onChange={handleChange}
placeholder="Confirm Password"
className="w-full rounded-2xl bg-blue-50 border border-blue-200 py-4 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-100"
/>

<button
type="button"
onClick={() => setShowConfirm(!showConfirm)}
className="absolute right-4 top-4 text-slate-500"
>

{showConfirm ? <EyeOff size={20}/> : <Eye size={20}/>}

</button>

</div>

</div>

{error && (

<div className="rounded-xl bg-red-100 border border-red-300 p-3 text-red-600 text-center font-semibold">

{error}

</div>

)}

<button

disabled={loading}

className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 py-4 font-black text-slate-900 shadow-lg hover:scale-[1.02] transition"

>

{loading ? 'Creating Account...' : 'Create Account'}

</button>

</form>

<div className="text-center mt-8">

<span className="text-slate-600">

Already have an account?

</span>

<Link

href="/auth/login"

className="block mt-3 font-black text-brand-blue hover:text-amber-500"

>

Login

</Link>

</div>

</div>

</div>

  );

}
