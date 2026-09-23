'use client';

import { FormEvent, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DEFAULT_SITE_SETTINGS, PublicSiteSettings, normalizeSiteSettings } from "@/lib/siteSettings";

export default function CommunicationSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);
  const [quickActions, setQuickActions] = useState(DEFAULT_SITE_SETTINGS.chatbotQuickActions.join("\n"));
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" }).then((response) => response.json()).then((data) => {
      const next = normalizeSiteSettings(data);
      setSettings(next);
      setQuickActions(next.chatbotQuickActions.join("\n"));
    }).catch(() => setStatus("تعذر تحميل الإعدادات."));
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...settings, chatbotQuickActions: quickActions.split("\n") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSettings(normalizeSiteSettings(data));
      setStatus("تم حفظ إعدادات التواصل.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "تعذر حفظ الإعدادات.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card hoverEffect={false} className="border-amber-200/80 rounded-3xl p-6 shadow-sm bg-white">
      <form onSubmit={save} className="space-y-4">
        <div><h2 className="text-base font-black text-slate-800">التواصل والمساعد الذكي</h2><p className="mt-1 text-xs text-slate-500">تحكم في زر واتساب والمساعد الظاهر للزوار.</p></div>
        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-700"><span>تفعيل المساعد الذكي</span><input type="checkbox" checked={settings.chatbotEnabled} onChange={(event) => setSettings({ ...settings, chatbotEnabled: event.target.checked })} className="h-4 w-4 accent-amber-500" /></label>
        <label className="block text-xs font-bold text-slate-700">رقم واتساب العام<input value={settings.whatsappNumber} onChange={(event) => setSettings({ ...settings, whatsappNumber: event.target.value })} dir="ltr" inputMode="tel" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-sans text-sm outline-none focus:border-amber-400" /></label>
        <label className="block text-xs font-bold text-slate-700">رسالة واتساب الافتراضية<textarea value={settings.whatsappMessage} onChange={(event) => setSettings({ ...settings, whatsappMessage: event.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-sans text-sm outline-none focus:border-amber-400" /></label>
        <label className="block text-xs font-bold text-slate-700">رسالة الترحيب<textarea value={settings.chatbotWelcomeMessage} onChange={(event) => setSettings({ ...settings, chatbotWelcomeMessage: event.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-sans text-sm outline-none focus:border-amber-400" /></label>
        <label className="block text-xs font-bold text-slate-700">الإجراءات السريعة، إجراء في كل سطر<textarea value={quickActions} onChange={(event) => setQuickActions(event.target.value)} rows={5} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-sans text-sm outline-none focus:border-amber-400" /></label>
        <div className="flex items-center justify-between gap-3"><button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</button>{status && <span role="status" className="text-xs font-semibold text-slate-600">{status}</span>}</div>
      </form>
    </Card>
  );
}
