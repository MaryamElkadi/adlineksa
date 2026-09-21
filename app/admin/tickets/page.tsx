"use client";

import { useEffect, useState } from "react";

interface Message {
  _id?: string;
  sender: "customer" | "admin";
  senderName: string;
  text: string;
  isInternalNote?: boolean;
  createdAt: string;
}

interface Ticket {
  _id: string;
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  messages: Message[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newPriority, setNewPriority] = useState<string>("");
  const [sending, setSending] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets?admin=true");
      const data = res.ok ? await res.json() : [];
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      alert("فشل تحميل التذاكر");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setSending(true);
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText,
          isInternalNote: isInternal,
          status: newStatus || selectedTicket.status,
        }),
      });

      if (!res.ok) throw new Error("فشل إرسال الرد");

      const updated = await res.json();
      setSelectedTicket(updated);
      setReplyText("");
      setIsInternal(false);
      loadData();
    } catch {
      alert("حدث خطأ أثناء إرسال الرد");
    } finally {
      setSending(false);
    }
  }

  async function handleUpdateStatusPriority(status?: string, priority?: string) {
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status || selectedTicket.status,
          priority: priority || selectedTicket.priority,
        }),
      });

      if (!res.ok) throw new Error("فشل تحديث التذكرة");

      const updated = await res.json();
      setSelectedTicket(updated);
      loadData();
    } catch {
      alert("حدث خطأ أثناء التحديث");
    }
  }

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-black">مفتوحة 🟢</span>;
      case "In Progress":
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-full text-xs font-black">قيد المعالجة ⚙️</span>;
      case "Resolved":
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-black">تم الحل ✅</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1 rounded-full text-xs font-black">مغلقة 🔒</span>;
    }
  };

  return (
    <div dir="rtl" className="space-y-8 p-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 block mb-1">مركز الدعم الفني وخدمة العملاء</span>
          <h1 className="text-3xl font-black text-slate-900">تذاكر الدعم الفني (Support Center)</h1>
        </div>
        <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">التذاكر المفتوحة</span>
          <span className="text-2xl font-black text-amber-500">
            {tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xs">
        <input
          type="text"
          placeholder="بحث برقم التذكرة، العنوان، القسم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
        />

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600">التصفية حسب الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold"
          >
            <option value="all">جميع الحالات</option>
            <option value="Open">مفتوحة (Open)</option>
            <option value="In Progress">قيد المعالجة (In Progress)</option>
            <option value="Resolved">تم الحل (Resolved)</option>
            <option value="Closed">مغلقة (Closed)</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="p-4">رقم التذكرة</th>
                <th className="p-4">الموضوع والقسم</th>
                <th className="p-4">الأولوية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">تاريخ الإنشاء</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">جاري تحميل البيانات...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">لا توجد تذاكر تطابق البحث.</td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{t.subject}</div>
                      <div className="text-[11px] text-amber-700 font-bold">{t.category}</div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold px-2 py-0.5 rounded-md ${
                        t.priority === "High" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(t.status)}</td>
                    <td className="p-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString("ar-SA")}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setNewStatus(t.status);
                          setNewPriority(t.priority);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-2xs"
                      >
                        فتح التذكرة والرد ←
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Conversation & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-600 text-sm">{selectedTicket.ticketNumber}</span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedTicket.subject}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 text-lg font-bold">✕</button>
            </div>

            {/* Status & Priority Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600">تغيير الحالة:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatusPriority(e.target.value, undefined)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold"
                >
                  <option value="Open">مفتوحة (Open)</option>
                  <option value="In Progress">قيد المعالجة (In Progress)</option>
                  <option value="Resolved">تم الحل (Resolved)</option>
                  <option value="Closed">مغلقة (Closed)</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600">الأولوية:</span>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => handleUpdateStatusPriority(undefined, e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-4 max-h-80 overflow-y-auto p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
              {selectedTicket.messages?.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`p-4 rounded-2xl space-y-1.5 text-xs ${
                    msg.isInternalNote
                      ? "bg-purple-100 border border-purple-300 text-purple-950"
                      : msg.sender === "admin"
                      ? "bg-amber-100 border border-amber-200 text-slate-900 mr-6"
                      : "bg-white border border-slate-200 text-slate-900 ml-6"
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-[11px]">
                    <span className={msg.isInternalNote ? "text-purple-900 font-black" : "text-slate-700"}>
                      {msg.isInternalNote ? "🔒 ملاحظة داخلية للإدارة فقط" : msg.senderName || (msg.sender === "admin" ? "فريق الدعم" : "العميل")}
                    </span>
                    <span className="text-slate-400 font-normal">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString("ar-SA") : ""}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">كتابة رد جديد:</label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-purple-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>إضافة كملاحظة داخلية للإدارة فقط (لن تظهر للعميل)</span>
                </label>
              </div>

              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={isInternal ? "اكتب ملاحظة داخلية بين أفراد فريق الدعم..." : "اكتب ردك للعميل..."}
                className={`w-full p-3 text-xs rounded-2xl border outline-none transition-all ${
                  isInternal
                    ? "bg-purple-50 border-purple-300 focus:border-purple-500"
                    : "bg-slate-50 border-slate-200 focus:border-amber-400"
                }`}
              />

              <button
                type="submit"
                disabled={sending}
                className={`w-full py-3.5 font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer ${
                  isInternal
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-amber-400 hover:bg-amber-500 text-slate-950"
                }`}
              >
                {sending ? "جاري الإرسال..." : isInternal ? "حفظ كـ ملاحظة داخلية 🔒" : "إرسال الرد للعميل ←"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
