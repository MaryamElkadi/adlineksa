'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/services/api';

export default function CheckoutPage() {
  const { items, total, subtotal, tax, shipping, clearCart, updateQuantity, removeItem } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'applepay' | 'stcpay' | 'invoice'>('mada');
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'الرياض',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const newOrder = await api.createOrder({
        items,
        total,
        customer: { fullName: form.fullName, email: form.email, phone: form.phone },
        paymentMethod,
        shippingAddress: `${form.address}، ${form.city}، المملكة العربية السعودية`,
      });

      clearCart();
      setOrderPlaced(newOrder);
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : 'تعذر تأكيد الطلب. حاولي مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-md animate-bounce">
          ✓
        </div>
        <h1 className="text-3xl font-black text-brand-blue">تم تأكيد طلبك بنجاح! 🎉</h1>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          شكراً لاختيارك خط الإعلان السعودية. رقم الطلب الخاص بك هو{' '}
          <span className="font-black text-amber-600 dir-ltr inline-block">#{orderPlaced.orderNumber}</span>.
        </p>

        <div className="bg-gradient-to-br from-amber-50/60 via-white to-sky-50/40 border border-slate-200 rounded-3xl p-6 text-right space-y-3 text-xs font-semibold shadow-xs">
          <p className="text-slate-700">
            <strong className="text-brand-blue">حالة الطلب:</strong> {orderPlaced.status}
          </p>
          <p className="text-slate-700">
            <strong className="text-brand-blue">عنوان التوصيل:</strong> {orderPlaced.shippingAddress}
          </p>
          <p className="text-slate-700">
            <strong className="text-brand-blue">الإجمالي المدفوع:</strong>{' '}
            <span className="text-amber-600 font-black text-sm">{formatCurrency(orderPlaced.total)}</span>
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <Link href="/dashboard">
            <Button variant="yellow" className="font-black !text-slate-800 bg-amber-400 hover:bg-amber-500 border-0 shadow-md">
              الانتقال إلى لوحة التحكم ←
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-right">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-brand-blue flex items-center gap-3">
          <span>💳</span> إتمام عملية الدفع
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          أدخل بيانات الشحن واختر طريقة الدفع المناسبة لإكمال طلبك بسرعة وأمان.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {submitError && (
          <p role="alert" className="lg:col-span-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {submitError}
          </p>
        )}
        {/* Customer & Shipping Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="text-lg font-black text-brand-blue mb-2 flex items-center gap-2">
              <span>1️⃣</span> معلومات الشحن والتوصيل
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الاسم الكامل"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="سامي العتيبي"
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="رقم الجوال (المملكة)"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="XXXX XXX 5X 966+"
              />
              <Input
                label="المدينة"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <Input
              label="العنوان / الحي والشارع"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="شارع العليا، مبنى 402"
            />
          </div>

          {/* Payment Selection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">

          </div>
        </div>

        {/* Order Summary Side panel */}
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-sky-50/40 border border-amber-200/80 rounded-3xl p-6 h-fit space-y-6 shadow-sm">
          <h2 className="text-lg font-black text-brand-blue border-b border-slate-200/80 pb-3">
            مراجعة الطلب ({items.length} منتجات) 🛍️
          </h2>

          <div className="space-y-3 max-h-[26rem] overflow-y-auto pl-1">
            {items.map((it) => (
              <div
                key={it.id}
                className="bg-white/80 rounded-xl border border-slate-100 p-3 space-y-2 transition-all hover:border-amber-200 hover:shadow-sm"
              >
                {/* Product name & remove */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 leading-snug flex-1">
                    {it.productName}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors text-sm leading-none shrink-0"
                    aria-label="حذف المنتج"
                    title="حذف"
                  >
                    ✕
                  </button>
                </div>

                {/* Size & Material info */}
                {(it.size || it.material) && (
                  <div className="flex flex-wrap gap-1.5">
                    {it.size && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                        {it.size}
                      </span>
                    )}
                    {it.designPlacement && <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 rounded-md px-1.5 py-0.5">{it.designPlacement}</span>}
                    {it.printSide && <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 rounded-md px-1.5 py-0.5">{it.printSide}</span>}
                    {it.installation && <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 rounded-md px-1.5 py-0.5">مع تركيب</span>}
                    {it.material && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                        {it.material}
                      </span>
                    )}
                    {it.color && (
                      <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-md px-1.5 py-0.5">
                        {it.colorHex && <span className="inline-block h-2.5 w-2.5 rounded-full border border-black/15 ml-1 align-middle" style={{ backgroundColor: it.colorHex }} />}
                        {it.color}
                      </span>
                    )}
                    {it.pricingType === 'meter' && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                        بالمتر
                      </span>
                    )}
                  </div>
                )}
                {it.designBrief && (
                  <p className="text-[10px] text-slate-500">تفاصيل التصميم: {it.designBrief}</p>
                )}

                {/* Quantity controls & price */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors"
                      aria-label="تقليل الكمية"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          updateQuantity(it.id, val);
                        }
                      }}
                      className="w-12 h-7 text-center text-xs font-black text-brand-blue bg-white border-x border-slate-200 outline-none focus:ring-1 focus:ring-amber-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-left space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-medium">
                      {formatCurrency(it.unitPrice)} × {it.quantity}
                    </div>
                    <div className="text-xs font-black text-amber-600">
                      {formatCurrency(it.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400 font-medium">
                🛒 السلة فارغة
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs font-bold">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>رسوم التوصيل</span>
              <span>{shipping === 0 ? 'مجاناً ✨' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-brand-blue pt-2 border-t border-dashed border-slate-200">
              <span>الإجمالي المستحق</span>
              <span className="text-amber-600 text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="yellow"
            className="w-full font-black text-base py-3.5 !text-slate-800 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 transition-all shadow-md hover:shadow-lg border-0"
            isLoading={isSubmitting}
            disabled={items.length === 0}
          >
            تأكيد ودفع {formatCurrency(total)} 🚀
          </Button>
        </div>
      </form>
    </div>
  );
}
