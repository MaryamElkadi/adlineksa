'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Category } from '@/types';
import { api } from '@/services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState('');
  const load = () => api.getCategories().then(setCategories).catch(() => setMessage('Could not load categories.'));
  useEffect(() => { void load(); }, []);
  async function remove(category: Category) {
    if (!confirm(`Delete ${category.name}?`)) return;
    const response = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
    if (response.ok) load(); else setMessage((await response.json()).message || 'Could not delete category.');
  }
  return <div dir="rtl" className="space-y-6 text-right"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-black text-slate-800">إدارة التصنيفات</h1><p className="text-sm text-slate-500 mt-1">إضافة وتنظيم تصنيفات المنتجات</p></div><Link href="/admin/categories/add" className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-900 hover:bg-amber-300">+ إضافة تصنيف</Link></div>{message && <p className="rounded-xl bg-rose-50 p-3 text-rose-700">{message}</p>}<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-4">التصنيف</th><th className="p-4">الرابط</th><th className="p-4">المنتجات</th><th className="p-4">الحالة</th><th className="p-4">الإجراءات</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id} className="border-t border-slate-100"><td className="p-4"><div className="flex items-center gap-3"><img src={category.image || '/globe.svg'} alt="" className="h-10 w-10 rounded-lg object-cover"/><span>{category.nameAr || category.name}</span></div></td><td className="p-4 font-mono text-xs">/{category.slug}</td><td className="p-4">{category.itemCount || 0}</td><td className="p-4">{category.active === false ? 'غير نشط' : 'نشط'}</td><td className="p-4"><Link className="ml-3 text-amber-700" href={`/admin/categories/${category.id}`}>تعديل</Link><button className="text-rose-600" onClick={() => remove(category)}>حذف</button></td></tr>)}</tbody></table></div></div>;
}
