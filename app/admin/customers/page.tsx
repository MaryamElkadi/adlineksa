'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([
    { id: 'c-1', name: 'سامي العتيبي', email: 'sami@company.sa', phone: '+966 50 123 4567', totalSpent: 4250, ordersCount: 12, status: 'Active' },
    { id: 'c-2', name: 'نورة الغامدي', email: 'noura@design.sa', phone: '+966 55 987 6543', totalSpent: 12800, ordersCount: 24, status: 'VIP Member' },
    { id: 'c-3', name: 'فهد الدوسري', email: 'fahad@agency.com', phone: '+966 54 321 0987', totalSpent: 1850, ordersCount: 5, status: 'Active' },
  ]);

  const toggleStatus = (id: string) => {
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Blocked' ? 'Active' : 'Blocked' } : c
      )
    );
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'VIP Member':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300/70 text-xs font-black px-3 py-1 rounded-xl shadow-2xs">
            👑 عضو VIP
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-xl">
            🚫 محظور
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-3 py-1 rounded-xl">
            ⚡ نشط
          </span>
        );
    }
  };

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <div>
          <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
            👥 إدارة العملاء والاشتراكات
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">سجل حسابات العملاء</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            عرض بيانات التواصل، إجمالي المبيعات، الطلبات، وصلاحيات الوصول
          </p>
        </div>
      </div>

      {/* Customers Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-medium text-slate-700">
            <thead className="bg-gradient-to-r from-slate-50 to-amber-50/30 text-slate-800 uppercase font-black text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="p-4">اسم العميل</th>
                <th className="p-4">البريد / الجوال</th>
                <th className="p-4">عدد الطلبات</th>
                <th className="p-4">إجمالي الإنفاق</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((cust) => (
                <tr key={cust.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-4 font-black text-slate-800 text-sm">{cust.name}</td>
                  <td className="p-4 text-slate-600">
                    <span className="block font-bold text-slate-800">{cust.email}</span>
                    <span className="text-[11px] text-slate-400 font-mono tracking-wide" dir="ltr">
                      {cust.phone}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-slate-700">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 font-mono">
                      {cust.ordersCount} طلبات
                    </span>
                  </td>
                  <td className="p-4 font-black text-amber-600 text-sm">
                    {formatCurrency(cust.totalSpent)}
                  </td>
                  <td className="p-4">{renderStatusBadge(cust.status)}</td>
                  <td className="p-4 text-left space-x-2 space-x-reverse">
                    <button
                      onClick={() => toggleStatus(cust.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs ${
                        cust.status === 'Blocked'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {cust.status === 'Blocked' ? 'إلغاء الحظر 🔓' : 'حظر الحساب 🚫'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}