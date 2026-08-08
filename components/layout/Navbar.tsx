'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, User, LogOut, Home, Menu } from 'lucide-react';

import { useCart } from '@/hooks/useCart';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);

    // Dispatch event so all components update instantly
    window.dispatchEvent(new Event('auth-change'));

    router.push('/');
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
                src="/LOGO.jpeg"
                alt="Adline KSA"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
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
            <Link href="/about" className="hover:text-slate-900 transition-colors">من نحن</Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">اتصل بنا</Link>
            <Link href="/quote" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">طلب عرض سعر</Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">

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
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};