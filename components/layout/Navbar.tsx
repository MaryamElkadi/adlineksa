'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, User, LogOut, Home, Menu, Search } from 'lucide-react';

import { useCart } from '@/hooks/useCart';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  // Function to sync user state from localStorage
  const syncUserState = () => {
    const data = localStorage.getItem("user");
    if (data) {
      try {
        setUser(JSON.parse(data));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // 1. Initial state load
    syncUserState();

    // 2. Listen for custom auth events fired in the same tab
    const handleAuthChange = () => syncUserState();
    window.addEventListener('auth-change', handleAuthChange);

    // 3. Listen for localStorage changes across other tabs
    window.addEventListener('storage', syncUserState);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', syncUserState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { api } = await import('@/services/api');
      await api.logout().catch(() => {});
    } catch (e) {
      console.error('Logout request error:', e);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("adline_cart");
    setUser(null);

    // Dispatch events so all components and useCart update instantly without browser refresh
    window.dispatchEvent(new Event('auth-change'));
    window.dispatchEvent(new Event('cart-change'));

    router.push('/');
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setMobileSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <header
        dir="rtl"
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg border border-slate-100 overflow-hidden group-hover:border-slate-300 transition-colors shadow-sm">
              <Image
                src="/logo.jpeg"
                alt="Adline KSA"
                width={40}
                height={40}
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-none">
                Adline <span className="text-amber-500">KSA</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                خط الإعلان للطباعة
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">الرئيسية</Link>
            <Link href="/categories" className="hover:text-slate-900 transition-colors">الفئات</Link>
            <Link href="/products" className="hover:text-slate-900 transition-colors">المنتجات</Link>
            <Link href="/services" className="hover:text-slate-900 transition-colors">الخدمات</Link>
            <Link href="/exhibitions" className="hover:text-slate-900 transition-colors">تنظيم معارض</Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">اتصل بنا</Link>
            <Link href="/quote" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">طلب عرض سعر</Link>
          </nav>

          <form onSubmit={submitSearch} className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث عن منتج..."
              aria-label="ابحث عن منتج"
              className="w-36 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button type="submit" aria-label="بحث" className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-brand-blue">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((open) => !open)}
              className="xl:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200"
              aria-label="افتح البحث"
              aria-expanded={mobileSearchOpen}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 min-w-[16px] h-[16px] px-1 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {!user ? (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-sm active:scale-[0.98]"
              >
                تسجيل الدخول
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Home Link */}
                <Link
                  href="/"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 text-xs font-medium transition-all"
                >
                  <Home className="w-3.5 h-3.5" />
                  الموقع
                </Link>

                {/* Dashboard / Profile */}
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
                >
                  {user.role === "admin" ? (
                    <>
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      لوحة الإدارة
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5" />
                      الملف الشخصي
                    </>
                  )}
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-xs font-medium transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  تسجيل الخروج
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
              aria-label="افتح القائمة"
            >
              <Menu className="w-4 h-4" />
            </button>

          </div>
        </div>
        {mobileSearchOpen && (
          <form onSubmit={submitSearch} className="xl:hidden px-4 pb-3 sm:px-6">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ابحث عن منتج..."
                aria-label="ابحث عن منتج"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button type="submit" className="text-xs font-bold text-brand-blue">بحث</button>
            </div>
          </form>
        )}
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};
