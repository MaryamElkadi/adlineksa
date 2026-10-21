"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SettingsResponse {
  marketplace: string;
  connected: boolean;
  status: string;
  accountName: string | null;
  sellerId: string | null;
  clientId: string | null;
  hasCredentials: boolean;
}

export default function MarketplaceSettingsPage() {
  const { marketplace } = useParams() as { marketplace: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);

  const [accountName, setAccountName] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/admin/marketplaces/${marketplace}/settings`);
      const json: SettingsResponse = await res.json();
      setSettings(json);
      setAccountName(json.accountName ?? '');
      setSellerId(json.sellerId ?? '');
      setClientId(json.clientId ?? '');
      // Secrets are never returned; keep inputs empty (placeholder will show "Saved" when appropriate)
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    // Validate fake client ID only; allow saving without sellerId/refreshToken
    if (clientId && clientId.trim() === 'admin@adlineksa.com') {
      alert('يرجى عدم استخدام معرف عميل مزيف.');
      return;
    }
    const payload: any = {
      accountName: accountName || undefined,
      sellerId: sellerId || undefined,
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      refreshToken: refreshToken || undefined,
    };
    try {
      const res = await fetch(`/api/admin/marketplaces/${marketplace}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      await fetchSettings();
      alert('تم حفظ الإعدادات بنجاح');
    } catch (e) {
      console.error(e);
      alert('خطأ في حفظ الإعدادات');
    }
  };

  const handleTest = () => {
    alert('اختبار الاتصال غير متاح حتى يتم تكوين بيانات الاعتماد الفعلية للمنصة.');
  };

  const handleDisconnect = async () => {
    if (!confirm('هل متأكد من قطع الاتصال؟')) return;
    try {
      const res = await fetch(`/api/admin/marketplaces/${marketplace}/disconnect`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Disconnect failed');
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('خطأ في قطع الاتصال');
    }
  };

  if (loading) return <div className="p-4">جاري التحميل...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/admin/marketplaces" className="text-amber-600 hover:underline">
        ← العودة إلى السوق
      </Link>

      <h1 className="text-2xl font-bold mb-2">
        {settings?.marketplace?.toUpperCase()} إعدادات الاتصال
      </h1>

      <div className="flex items-center space-x-2 mb-4">
        <span
          className={`inline-block w-2 h-2 rounded-full ${settings?.connected ? 'bg-emerald-500' : 'bg-gray-400'}`}
        ></span>
        <span className="text-sm">{settings?.connected ? 'متصل' : 'غير متصل'}</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">اسم الحساب</label>
          <input
            type="text"
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">معرف البائع / Merchant ID</label>
          <input
            type="text"
            value={sellerId}
            onChange={e => setSellerId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Client Secret</label>
          <input
            type="password"
            placeholder={clientSecret ? 'Saved' : ''}
            value={clientSecret}
            onChange={e => setClientSecret(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Refresh Token</label>
          <input
            type="password"
            placeholder={refreshToken ? 'Saved' : ''}
            value={refreshToken}
            onChange={e => setRefreshToken(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <button onClick={handleSave} className="px-4 py-2 bg-amber-600 text-white rounded">
          حفظ الاتصال
        </button>
        <button onClick={handleTest} className="px-4 py-2 bg-amber-400 text-white rounded">
          اختبار الاتصال
        </button>
        {settings?.connected && (
          <button onClick={handleDisconnect} className="px-4 py-2 bg-red-600 text-white rounded">
            قطع الاتصال
          </button>
        )}
      </div>
    </div>
  );
}
