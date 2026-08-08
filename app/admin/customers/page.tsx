'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CustomerUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadCustomers = () => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('تعذر تحميل بيانات العملاء.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const toggleUserStatus = async (userId: string, currentIsActive: boolean) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentIsActive }),
      });
      if (res.ok) {
        loadCustomers();
      } else {
        setError('فشل تغيير حالة حساب العميل.');
      }
    } catch {
      setError('فشل تغيير حالة حساب العميل.');
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        loadCustomers();
      } else {
        setError('فشل تحديث صلاحيات العميل.');
      }
    } catch {
      setError('فشل تحديث صلاحيات العميل.');
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        !searchQuery ||
        cust.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery);

      const matchesRole =
        roleFilter === 'all' || cust.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [customers, searchQuery, roleFilter]);

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <div>
          <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
            👥 إدارة العملاء وحسابات المستخدمين
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">سجل حسابات العملاء</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            عرض وتصفية بيانات جميع الحسابات المسجلة، إجمالي الطلبات والإنفاق والصلاحيات
          </p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-rose-50 p-3 text-rose-600 font-bold text-xs">{error}</p>}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full md:w-80">
          <input
            type="text"
            placeholder="بحث باسم العميل، البريد الإلكتروني، الجوال..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-600">نوع الحساب:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-bold text-slate-700"
          >
            <option value="all">جميع الحسابات</option>
            <option value="user">عملاء فقط (User)</option>
            <option value="admin">مدراء فقط (Admin)</option>
          </select>
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
                <th className="p-4">الرتبة</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    جاري تحميل جميع العملاء...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    لا يوجد عملاء يطابقون خيارات التصفية.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 font-black text-slate-800 text-sm">{cust.fullName}</td>
                    <td className="p-4 text-slate-600">
                      <span className="block font-bold text-slate-800">{cust.email}</span>
                      <span className="text-[11px] text-slate-400 font-mono tracking-wide" dir="ltr">
                        {cust.phone || '—'}
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
                    <td className="p-4">
                      <button
                        onClick={() => toggleUserRole(cust._id, cust.role)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all border ${
                          cust.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="انقر لتغيير الرتبة"
                      >
                        {cust.role === 'admin' ? '👑 مدير (Admin)' : '👤 عميل (User)'}
                      </button>
                    </td>
                    <td className="p-4">
                      {cust.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-xl">
                          ⚡ نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-xl">
                          🚫 محظور
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-left space-x-2 space-x-reverse">
                      <button
                        onClick={() => toggleUserStatus(cust._id, cust.isActive)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs ${
                          !cust.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {!cust.isActive ? 'إلغاء الحظر 🔓' : 'حظر الحساب 🚫'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}