'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
}

interface UserItem {
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

interface DashboardData {
  stats: {
    label: string;
    value: string;
    change: string;
  }[];
  allOrders: OrderItem[];
  recentOrders: OrderItem[];
  allUsers: UserItem[];
  recentQuotations: any[];
  products: number;
  categories: number;
  orders: number;
  quotations: number;
  users: number;
  pendingOrders: number;
  pendingQuotations: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');

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
      case 'Delivered':
        return 'green';
      case 'Shipped':
        return 'blue';
      case 'In Production':
        return 'blue';
      case 'Cancelled':
        return 'red';
      default:
        return 'yellow';
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const ordersList = dashboard?.allOrders || dashboard?.recentOrders || [];
    return ordersList.filter((ord) => {
      const matchesSearch =
        !searchQuery ||
        ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customer?.phone?.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' || ord.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dashboard, searchQuery, statusFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const usersList = dashboard?.allUsers || [];
    return usersList.filter((usr) => {
      return (
        !searchQuery ||
        usr.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usr.phone.includes(searchQuery)
      );
    });
  }, [dashboard, searchQuery]);

  return (
    <div dir="rtl" className="space-y-8 text-right font-sans">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            الملخص التنفيذي والإدارة العامة
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
            <Button size="sm">
              عرض جميع الطلبات ←
            </Button>
          </Link>
          <Link href="/admin/customers">
            <Button size="sm" variant="outline">
              إدارة العملاء 👥
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
        ) : Array.isArray(dashboard?.stats) ? (
          dashboard.stats.map((st, idx) => (
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
        ) : null}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📦 جميع الطلبات ({dashboard?.allOrders?.length || dashboard?.orders || 0})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'users'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              👥 جميع العملاء ({dashboard?.allUsers?.length || dashboard?.users || 0})
            </button>
          </div>

          {/* Search Box & Status Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                placeholder={activeTab === 'orders' ? 'بحث برقم الطلب، اسم العميل، البريد...' : 'بحث باسم العميل، البريد، الجوال...'}
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

            {activeTab === 'orders' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-bold text-slate-700"
              >
                <option value="all">جميع الحالات</option>
                <option value="Pending">قيد الانتظار (Pending)</option>
                <option value="In Production">جاري التنفيذ (In Production)</option>
                <option value="Shipped">تم الشحن (Shipped)</option>
                <option value="Delivered">تم التوصيل (Delivered)</option>
                <option value="Cancelled">ملغي (Cancelled)</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: Orders Table */}
        {activeTab === 'orders' && (
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
                      جاري تحميل الطلبات...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                      لا توجد طلبات تطابق معايير البحث والفلترة.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{ord.orderNumber}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{ord.customer?.fullName || 'عميل زائر'}</div>
                        <div className="text-[11px] text-slate-400">{ord.customer?.email}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div className="space-y-1">
                          {ord.items?.map((item, index) => (
                            <div key={index}>
                              {item.productName}
                              <span className="text-slate-400"> × {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-black text-slate-800">{formatCurrency(ord.total)}</td>
                      <td className="p-3">
                        <Badge variant={getBadgeVariant(ord.status)}>
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-400 font-medium">
                        {new Date(ord.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Users Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs font-medium text-slate-700">
              <thead className="bg-slate-50 text-slate-800 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">اسم العميل</th>
                  <th className="p-3">البريد الإلكتروني</th>
                  <th className="p-3">الجوال</th>
                  <th className="p-3">عدد الطلبات</th>
                  <th className="p-3">إجمالي الإنفاق</th>
                  <th className="p-3">الرتبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                      جاري تحميل بيانات العملاء...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                      لا يوجد عملاء يطابقون معايير البحث.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{usr.fullName}</td>
                      <td className="p-3 text-slate-600">{usr.email}</td>
                      <td className="p-3 text-slate-500 font-mono" dir="ltr">{usr.phone || '—'}</td>
                      <td className="p-3 font-extrabold text-slate-800">{usr.ordersCount} طلبات</td>
                      <td className="p-3 font-black text-amber-600">{formatCurrency(usr.totalSpent)}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          usr.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {usr.role === 'admin' ? 'مدير نظام 👑' : 'عميل 👤'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}