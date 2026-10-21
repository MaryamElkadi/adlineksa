'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Category } from '@/types';

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const [category, setCategory] = useState<Partial<Category>>({}); const [message, setMessage] = useState('');
  useEffect(() => { fetch(`/api/categories/${id}`).then((response) => response.json()).then(setCategory).catch(() => setMessage('Could not load category.')); }, [id]);
  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCategory({ ...category, [event.target.name]: event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value });
  async function submit(event: React.FormEvent) { event.preventDefault(); const response = await fetch(`/api/categories/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) }); if (response.ok) router.push('/admin/categories'); else setMessage((await response.json()).message || 'Could not save category.'); }
  return <form dir="rtl" onSubmit={submit} className="max-w-2xl space-y-5 rounded-2xl bg-white p-6 text-right shadow-sm"><h1 className="text-2xl font-black">تعديل التصنيف</h1>{message && <p className="text-rose-600">{message}</p>}{[['name', 'الاسم بالإنجليزية'], ['nameAr', 'الاسم بالعربية'], ['slug', 'الرابط'], ['image', 'رابط الصورة']].map(([name, label]) => <label key={name} className="block text-sm font-bold">{label}<input required={name !== 'image'} name={name} value={(category as Record<string, string>)[name] || ''} onChange={change} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>)}<label className="block text-sm font-bold">الوصف<textarea name="description" value={category.description || ''} onChange={change} className="mt-2 w-full rounded-xl border border-slate-200 p-3" rows={4} /></label><label className="flex items-center gap-2"><input name="active" type="checkbox" checked={category.active !== false} onChange={change} /> نشط</label><button className="rounded-xl bg-amber-400 px-5 py-3 font-bold">حفظ التغييرات</button></form>;
}
