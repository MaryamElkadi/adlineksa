'use client';

import { useEffect, useState } from 'react';
import { UserOrder } from '@/types';
import { formatCurrency } from '@/lib/utils';

const statuses: UserOrder['status'][] = ['Pending', 'In Production', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<UserOrder[]>([]); const [error, setError] = useState('');
  const load = () => fetch('/api/orders').then((response) => response.ok ? response.json() : Promise.reject()).then(setOrders).catch(() => setError('Could not load orders.'));
  useEffect(() => { void load(); }, []);
  async function updateStatus(id: string, status: UserOrder['status']) { const response = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); if (response.ok) load(); else setError('Could not update order.'); }
  return <div dir="rtl" className="space-y-6 text-right"><div><h1 className="text-3xl font-black">إدارة الطلبات</h1><p className="text-slate-500">الطلبات الجديدة من صفحة الدفع تظهر هنا تلقائياً.</p></div>{error && <p className="rounded-xl bg-rose-50 p-3 text-rose-600">{error}</p>}<div className="overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-4">رقم الطلب</th><th className="p-4">العميل</th><th className="p-4">المنتجات</th><th className="p-4">الإجمالي</th><th className="p-4">الحالة</th><th className="p-4">التاريخ</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t"><td className="p-4 font-mono">{order.orderNumber}</td><td className="p-4">{order.customer?.fullName || '—'}</td><td className="p-4">{order.itemsCount || order.items.length}</td><td className="p-4">{formatCurrency(order.total)}</td><td className="p-4"><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as UserOrder['status'])} className="rounded-lg border p-2">{statuses.map((status) => <option key={status}>{status}</option>)}</select></td><td className="p-4">{order.date || ''}</td></tr>)}</tbody></table></div></div>;
}
