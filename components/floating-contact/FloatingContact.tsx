'use client';

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { DEFAULT_SITE_SETTINGS, PublicSiteSettings, normalizeSiteSettings } from "@/lib/siteSettings";

type ChatLink = { label: string; href: string; kind: string };
type ChatMessage = { role: "user" | "assistant"; content: string; links?: ChatLink[]; retry?: string };

const ACTION_ROUTES: Record<string, string> = {
  "طلب تسعير": "/quote",
  "الطلبات والتتبع": "/dashboard",
  "مراجعة التصميم": "/dashboard?tab=proofs",
  "الدعم الفني": "/tickets",
  "التواصل معنا": "/contact",
};

export default function FloatingContact() {
  const router = useRouter();
  const pathname = usePathname();
  const endRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSettings(normalizeSiteSettings(data)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const openChat = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: settings.chatbotWelcomeMessage }]);
    }
  };

  const sendMessage = async (event?: FormEvent, preset?: string) => {
    event?.preventDefault();
    const content = (preset ?? input).trim();
    if (!content || sending) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, messages: nextMessages.slice(-20) }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "حصلت مشكلة مؤقتة وأنا بحاول أجيب الإجابة.");
      }

      setMessages((current) => [...current, { role: "assistant", content: "" }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n");
        buffer = events.pop() || "";
        for (const line of events) {
          if (!line.startsWith("data:")) continue;
          try {
            const payload = JSON.parse(line.slice(5).trim()) as { type: string; value?: string; links?: ChatLink[]; message?: string };
            if (payload.type === "meta") {
              setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, links: payload.links } : item));
            } else if (payload.type === "token" && payload.value) {
              setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: item.content + payload.value } : item));
            } else if (payload.type === "error") {
              throw new Error(payload.message || "حصلت مشكلة مؤقتة وأنا بحاول أجيب الإجابة.");
            }
          } catch (error) {
            if (error instanceof Error && error.message !== "Unexpected end of JSON input") throw error;
          }
        }
      }
    } catch (error) {
      const failure = error instanceof Error ? error.message : "حصلت مشكلة مؤقتة وأنا بحاول أجيب الإجابة.";
      setMessages((current) => {
        const last = current[current.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return [...current.slice(0, -1), { role: "assistant", content: failure, retry: content }];
        }
        return [...current, { role: "assistant", content: failure, retry: content }];
      });
    } finally {
      setSending(false);
    }
  };

  const handleAction = (action: string) => {
    const route = ACTION_ROUTES[action];
    if (route) {
      router.push(route);
      setOpen(false);
      return;
    }
    void sendMessage(undefined, action);
  };

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  const contextMessage = pathname === "/quote" ? "مرحباً، أريد المساعدة بخصوص طلب التسعير." : settings.whatsappMessage;
  const contextualWhatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(contextMessage)}`;

  return (
    <div dir="rtl" className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 pointer-events-none sm:inset-x-auto sm:right-5">
      {open && (
        <section role="dialog" aria-modal="false" aria-labelledby="chatbot-title" className="pointer-events-auto fixed bottom-20 left-4 right-4 flex max-h-[min(680px,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 sm:left-auto sm:right-5 sm:w-95">
          <header className="flex items-start justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <h2 id="chatbot-title" className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-amber-400" /> مساعد خط الإعلان</h2>
              <p className="mt-1 text-[11px] text-slate-300">كيف يمكنني مساعدتك؟</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق المساعد الذكي" className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"><X className="h-4 w-4" /></button>
          </header>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3 text-sm">
            <p className="text-[11px] text-slate-500">{settings.chatbotAvailabilityMessage}</p>
            <div className="flex flex-wrap gap-1.5">
              {settings.chatbotQuickActions.map((action) => <button key={action} type="button" onClick={() => handleAction(action)} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400">{action}</button>)}
            </div>
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 leading-6 ${message.role === "user" ? "mr-auto bg-slate-900 text-white" : "ml-auto border border-slate-200 bg-white text-slate-700"}`}>
              {message.content}
              {message.links && message.links.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                {message.links.map((link) => <a key={`${link.href}-${link.label}`} href={link.href} onClick={() => setOpen(false)} className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100">{link.label}</a>)}
              </div>}
              {message.retry && <button type="button" onClick={() => void sendMessage(undefined, message.retry)} className="mt-2 block text-[11px] font-bold text-amber-700 underline">إعادة المحاولة</button>}
            </div>)}
            {sending && <div className="ml-auto w-fit rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500" role="status">جاري الكتابة...</div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} disabled={sending} maxLength={1000} rows={1} aria-label="رسالة المساعد الذكي" placeholder="اكتب سؤالك هنا..." className="min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            <button type="submit" disabled={sending || !input.trim()} aria-label="إرسال الرسالة" className="rounded-xl bg-amber-500 px-3 text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}

      <div className="pointer-events-auto flex flex-col items-center gap-3">
        <a href={contextualWhatsappUrl || whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="التواصل معنا عبر واتساب" title="التواصل معنا عبر واتساب" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"><MessageCircle className="h-6 w-6" /></a>
        {settings.chatbotEnabled && <button type="button" onClick={open ? () => setOpen(false) : openChat} aria-label={open ? "إغلاق المساعد الذكي" : "فتح المساعد الذكي"} title={open ? "إغلاق المساعد الذكي" : "فتح المساعد الذكي"} className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-amber-400 shadow-lg transition hover:scale-105 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-300/40"><Bot className="h-6 w-6" /></button>}
      </div>
    </div>
  );
}
