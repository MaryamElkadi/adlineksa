'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
interface OrderItem {
  _id: string;
  orderNumber: string;

  customer: {
    fullName: string;
    email: string;
    phone: string;
  };

  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];

  total: number;
  status: string;
  createdAt: string;
}interface DashboardData {
  stats: {
    label: string;
    value: string;
    change: string;
  }[];

  recentOrders: OrderItem[];

  recentQuotations: any[];

  products: number;
  categories: number;
  orders: number;
  quotations: number;
  pendingOrders: number;
  pendingQuotations: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('فشل جلب بيانات لوحة التحكم:', err);
        setLoading(false);
      });
  }, []);
const getBadgeVariant = (status: string) => {
  switch (status) {
    case "Delivered":
      return "green";

    case "Shipped":
      return "blue";

    case "In Production":
      return "blue";

    case "Cancelled":
      return "red";

    default:
      return "yellow";
  }
};

  return (
    <div dir="rtl" className="space-y-8 text-right font-sans">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            الملخص التنفيذي
          </span>
          <h1 className="text-3xl font-black text-slate-800">نظرة عامة علي اللوحة</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button size="sm" variant="yellow">
              + إضافة منتج جديد
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button size="sm" variant="yelow" >
              عرض جميع الطلبات ←
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} hoverEffect={false} className="border-slate-200 bg-white p-5 rounded-2xl animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </Card>
          ))
        ) : (
          dashboard?.stats?.map((st, idx) => (
            <Card key={idx} hoverEffect={false} className="border-slate-200 bg-white p-5 rounded-2xl shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {st.label}
              </span>
              <div className="text-2xl font-black text-slate-800">{st.value}</div>
              <div className="mt-2 inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {st.change} مقارنة بالشهر الماضي
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Recent Orders Queue Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">قائمة الطلبات المباشرة</h2>
            <p className="text-xs text-slate-500 font-medium">متابعة لحظية لطلبات الطباعة في جميع المناطق</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-slate-800 hover:text-amber-600 transition-colors">
            إدارة الطلبات ←
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-medium text-slate-700">
            <thead className="bg-slate-50 text-slate-800 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">رقم الطلب</th>
                <th className="p-3">العميل</th>
                <th className="p-3">تفاصيل الطلب</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                    جاري تحميل الطلبات الحديثة...
                  </td>
                </tr>
              ) : dashboard?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                    لا توجد طلبات حديثة حالياً.
                  </td>
                </tr>
              ) : (
                dashboard?.recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-800">{ord.orderNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">{ord.customer.fullName}</td>
                    <td className="p-3 text-slate-600"><div className="space-y-1">
  {ord.items.map((item, index) => (
    <div key={index}>
      {item.productName}
      <span className="text-slate-400"> × {item.quantity}</span>
    </div>
  ))}
</div></td>
                    <td className="p-3 font-black text-slate-800">{formatCurrency(ord.total)}</td>
                    <td className="p-3">
                      <Badge variant={getBadgeVariant(ord.status)}>
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-400 font-medium">{new Date(ord.createdAt).toLocaleDateString("ar-SA")}</td>
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