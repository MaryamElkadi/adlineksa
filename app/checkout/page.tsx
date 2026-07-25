'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/services/api';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'applepay' | 'stcpay' | 'invoice'>('mada');
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <h2 className="text-lg font-black text-brand-blue mb-2 flex items-center gap-2">
              <span>2️⃣</span> طريقة الدفع
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'mada', label: '💳 مدى / بطاقات' },
                { id: 'applepay', label: '📱 Apple Pay' },
                { id: 'stcpay', label: '📲 STC Pay' },
                { id: 'invoice', label: '📄 تحويل بنكي' },
              ].map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-3.5 rounded-2xl border text-xs font-black text-center transition-all cursor-pointer ${
                    paymentMethod === method.id
                      ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Side panel */}
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-sky-50/40 border border-amber-200/80 rounded-3xl p-6 h-fit space-y-6 shadow-sm">
          <h2 className="text-lg font-black text-brand-blue border-b border-slate-200/80 pb-3">
            مراجعة الطلب ({items.length} منتجات) 🛍️
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pl-1">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-xs font-semibold text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-100">
                <span>
                  {it.productName} <span className="text-slate-400">(x{it.quantity})</span>
                </span>
                <span className="font-bold text-amber-600">{formatCurrency(it.totalPrice)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs font-bold">
            <div className="flex justify-between text-base font-black text-brand-blue">
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
          >
            تأكيد ودفع {formatCurrency(total)} 🚀
          </Button>
        </div>
      </form>
    </div>
  );
}
