'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, tax, shipping, total, isLoaded } = useCart();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'ADLINE10') {
      setDiscount(subtotal * 0.1);
    } else {
      alert('كود الخصم غير صحيح. جرب استخدام الكود ADLINE10 للحصول على خصم 10%.');
    }
  };

  const finalTotal = Math.max(0, total - discount);

  if (!isLoaded) {
    return (
      <div dir="rtl" className="p-16 text-center text-slate-500 font-bold text-sm">
        جاري تحميل سلة التسوق... 🛒
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-right">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <h1 className="text-3xl sm:text-4xl font-black text-brand-blue flex items-center gap-3">
          <span>🛒</span> سلة التسوق الخاصة بك
        </h1>
        {items.length > 0 && (
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
            {items.length} منتجات
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-amber-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="text-6xl animate-bounce">🛍️</div>
          <h2 className="text-2xl font-black text-brand-blue">سلة التسوق فارغة حالياً</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
            استعرض أقسامنا واختَر ما يناسبك من خيارات الطباعة المخصصة لإضافته إلى سلتك!
          </p>
          <div className="pt-2">
            <Link href="/products">
              <Button variant="yellow" className="font-black !text-slate-800 px-6 py-3 bg-amber-400 hover:bg-amber-500 border-0 shadow-md">
                تصفح المنتجات الآن ←
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover border border-amber-100 bg-slate-50 p-1"
                  />
                  <div>
                    <h3 className="text-base font-bold text-brand-blue">{item.productName}</h3>
                    <div className="text-xs text-slate-500 space-y-0.5 mt-1 font-medium">
                      <p>المقاس: <span className="text-slate-700">{item.size}</span></p>
                      <p>الخامة: <span className="text-slate-700">{item.material}</span></p>
                      {item.fileUrl && (
                        <p className="text-amber-600 font-semibold flex items-center gap-1 mt-1">
                          📎 الملف المرفق: <span className="underline">{item.fileUrl}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 50)}
                      className="px-3 py-1 text-slate-600 hover:text-brand-blue hover:bg-slate-200 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-black text-brand-blue">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 50)}
                      className="px-3 py-1 text-slate-600 hover:text-brand-blue hover:bg-slate-200 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Price & Delete */}
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-amber-600 block">
                      {formatCurrency(item.totalPrice)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold underline transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-gradient-to-br from-amber-50/60 via-white to-sky-50/40 border border-amber-200/80 rounded-3xl p-6 h-fit space-y-6 shadow-sm">
            <h2 className="text-lg font-black text-brand-blue border-b border-slate-200/80 pb-3">
              ملخص الطلب 📄
            </h2>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span>
                <span className="text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span className="text-slate-800">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الشحن</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">مجاني 🎉</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <span>خصم الكوبون</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-brand-blue pt-3 border-t border-slate-200">
                <span>الإجمالي النهائي</span>
                <span className="text-amber-600 text-lg">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">هل لديك كود خصم؟</label>
              <div className="flex gap-2">
                <Input
                  placeholder="كود الخصم (مثال: ADLINE10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="bg-white"
                />
                <Button size="sm" variant="secondary" onClick={applyCoupon} className="font-bold border-amber-300 hover:bg-amber-100 text-amber-900">
                  تطبيق
                </Button>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="block w-full">
              <Button
                size="lg"
                variant="yellow"
                className="w-full font-black text-base py-3.5 !text-slate-800 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md hover:shadow-lg border-0"
              >
                متابعة عملية الدفع ←
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}