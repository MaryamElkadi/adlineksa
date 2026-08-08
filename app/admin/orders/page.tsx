'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { UserOrder } from '@/types';
import { formatCurrency } from '@/lib/utils';

const statuses: UserOrder['status'][] = ['Pending', 'In Production', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    setLoading(true);
    fetch('/api/orders?admin=true')
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('تعذر تحميل جميع الطلبات.');
        setLoading(false);
      });
  };

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(id: string, status: UserOrder['status']) {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) load();
    else setError('تعذر تحديث حالة الطلب.');
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.phone?.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <div>
          <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
            📦 السجل الشامل لجميع الطلبات
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">إدارة جميع الطلبات</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            الطلبات المباشرة لجميع العملاء والمناطق مع أدوات التصفية وتغيير الحالة
          </p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-rose-50 p-3 text-rose-600 font-bold text-xs">{error}</p>}

      {/* Filter & Search Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full md:w-80">
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم العميل، البريد، الجوال..."
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
          <label className="text-xs font-bold text-slate-600">تصفية حسب الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-bold text-slate-700"
          >
            <option value="all">جميع الحالات</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-3xl bg-white border border-slate-200 shadow-xs">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-800 font-black text-xs">
            <tr>
              <th className="p-4">رقم الطلب</th>
              <th className="p-4">العميل</th>
              <th className="p-4">عدد المنتجات</th>
              <th className="p-4">الإجمالي</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                  جاري تحميل جميع الطلبات...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                  لا توجد طلبات تطابق الفلترة الحالية.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <React.Fragment key={order.id || order.orderNumber}>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800">{order.orderNumber}</td>

                    <td className="p-4">
                      <div className="font-bold text-slate-800">{order.customer?.fullName || 'عميل زائر'}</div>
                      <div className="text-xs text-slate-500">{order.customer?.email}</div>
                      <div className="text-xs text-slate-400 font-mono" dir="ltr">{order.customer?.phone}</div>
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      {order.items?.length || 0} منتجات
                    </td>

                    <td className="p-4 font-black text-amber-600">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(
                            order.id,
                            e.target.value as UserOrder['status']
                          )
                        }
                        className="rounded-xl border border-slate-200 p-2 text-xs font-bold bg-slate-50 focus:bg-white"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 text-xs text-slate-500 font-medium">{order.date}</td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
