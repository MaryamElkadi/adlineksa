'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle } from "lucide-react";
import { DEFAULT_SITE_SETTINGS, PublicSiteSettings, normalizeSiteSettings } from "@/lib/siteSettings";

const ChatPanel = dynamic(() => import("./ChatPanel"), {
  ssr: false,
  loading: () => <div className="pointer-events-auto fixed bottom-20 left-4 right-4 h-48 animate-pulse rounded-2xl border border-slate-200 bg-white sm:bottom-24 sm:left-auto sm:right-5 sm:w-95" role="status" aria-label="جاري تحميل المساعد الذكي" />,
});

export default function FloatingContact() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSettings(normalizeSiteSettings(data)))
      .catch(() => undefined);
  }, []);

  const contextMessage = pathname === "/quote" ? "مرحباً، أريد المساعدة بخصوص طلب التسعير." : settings.whatsappMessage;
  const contextualWhatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(contextMessage)}`;

  return (
    <div dir="rtl" className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 pointer-events-none sm:inset-x-auto sm:right-5">
      {open && <ChatPanel settings={settings} onClose={() => setOpen(false)} />}

      <div className="pointer-events-auto flex flex-col items-center gap-3">
        <a href={contextualWhatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="التواصل معنا عبر واتساب" title="التواصل معنا عبر واتساب" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"><MessageCircle className="h-6 w-6" /></a>
        {settings.chatbotEnabled && <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? "إغلاق المساعد الذكي" : "فتح المساعد الذكي"} title={open ? "إغلاق المساعد الذكي" : "فتح المساعد الذكي"} className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-amber-400 shadow-lg transition hover:scale-105 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-300/40"><Bot className="h-6 w-6" /></button>}
      </div>
    </div>
  );
}
