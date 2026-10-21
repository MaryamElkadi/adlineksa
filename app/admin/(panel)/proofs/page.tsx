"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Proof {
  _id: string;
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  type: string;
  proofStatus: "pending" | "approved" | "revision_requested";
  revisionNote?: string;
  adminComment?: string;
  version: number;
  versionHistory?: any[];
  userId: string;
  createdAt: string;
}

interface UserItem {
  _id: string;
  fullName: string;
  email: string;
}

export default function AdminProofsPage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Proof Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [proofName, setProofName] = useState("");
  const [proofDescription, setProofDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Selected for Revision Upload
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);
  const [revisionFileUrl, setRevisionFileUrl] = useState("");
  const [revisionComment, setRevisionComment] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [proofsRes, usersRes] = await Promise.all([
        fetch("/api/proofs?admin=true"),
        fetch("/api/users"),
      ]);

      const proofsData = proofsRes.ok ? await proofsRes.json() : [];
      const usersData = usersRes.ok ? await usersRes.json() : [];

      setProofs(Array.isArray(proofsData) ? proofsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch {
      alert("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateProof(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUserId || !proofName || !fileUrl) {
      alert("يرجى اختيار العميل وإدخال اسم ورابط البروفة");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/proofs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          name: proofName,
          description: proofDescription,
          fileUrl,
          adminComment,
        }),
      });

      if (!res.ok) throw new Error("فشل إرسال البروفة");

      alert("تم إرسال البروفة للعميل بنجاح!");
      setIsUploadOpen(false);
      setProofName("");
      setFileUrl("");
      setProofDescription("");
      loadData();
    } catch {
      alert("حدث خطأ أثناء إرسال البروفة");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadRevision(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProof || !revisionFileUrl) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/proofs/${selectedProof._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: revisionFileUrl,
          adminComment: revisionComment,
        }),
      });

      if (!res.ok) throw new Error("فشل رفع التعديل");

      alert("تم رفع التعديل الجديد (الإصدار الجديد) للعميل بنجاح!");
      setSelectedProof(null);
      setRevisionFileUrl("");
      setRevisionComment("");
      loadData();
    } catch {
      alert("حدث خطأ أثناء رفع التعديل");
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">معتمدة ✓</span>;
      case "revision_requested":
        return <span className="bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded-full text-xs">مطلوب تعديل 📝</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">بانتظار العميل ⏳</span>;
    }
  };

  return (
    <div dir="rtl" className="space-y-8 p-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 block mb-1">إدارة واعتماد بروفات الطباعة</span>
          <h1 className="text-3xl font-black text-slate-900">مراجعة البروفات والتصاميم</h1>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-md transition-all cursor-pointer"
        >
          + إرسال بروفة جديدة لعميل
        </button>
      </div>

      {/* Proofs Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h2 className="text-lg font-black text-slate-900">سجل البروفات النشطة ({proofs.length})</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium">جاري تحميل البيانات...</div>
        ) : proofs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">لا توجد بروفات تصاميم مرفوعة حالياً.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proofs.map((p) => (
              <div key={p._id} className="border border-slate-200 rounded-3xl p-6 space-y-4 bg-slate-50/50 shadow-xs hover:shadow-md transition-all relative">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{p.name}</span>
                      <span className="text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">v{p.version || 1}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.description || "لا يوجد وصف إضافي"}</p>
                  </div>
                  {getStatusBadge(p.proofStatus)}
                </div>

                {p.revisionNote && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs space-y-1">
                    <span className="font-black text-rose-800 block">ملاحظات التعديل من العميل:</span>
                    <p className="text-rose-900 font-medium">{p.revisionNote}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-200">
                  <a
                    href={p.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-amber-700 hover:underline flex items-center gap-1"
                  >
                    📎 معاينة الملف المرفق (v{p.version || 1})
                  </a>

                  {p.proofStatus === "revision_requested" && (
                    <button
                      onClick={() => setSelectedProof(p)}
                      className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
                    >
                      + رفع التعديل (الإصدار الجديد)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create New Proof */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateProof} className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">إرسال بروفة جديدة لعميل</h3>
              <button type="button" onClick={() => setIsUploadOpen(false)} className="text-slate-400">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اختر العميل المستهدف</label>
              <select
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
              >
                <option value="">-- اختر العميل --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان/اسم البروفة</label>
              <input
                type="text"
                required
                placeholder="مثال: بروفة كروت شخصية فاخرة"
                value={proofName}
                onChange={(e) => setProofName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط/مسار ملف البروفة (PDF/Image)</label>
              <input
                type="text"
                required
                placeholder="https://res.cloudinary.com/.../proof.pdf"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات توجيهية للعميل (اختياري)</label>
              <textarea
                rows={2}
                placeholder="تأكد من هامش القَص وألوان CMYK..."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-2xl text-xs shadow-md"
            >
              {submitting ? "جاري الإرسال..." : "إرسال البروفة للعميل ←"}
            </button>
          </form>
        </div>
      )}

      {/* Modal: Upload Revision Version */}
      {selectedProof && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUploadRevision} className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">رفع التعديل (إصدار v{(selectedProof.version || 1) + 1})</h3>
              <button type="button" onClick={() => setSelectedProof(null)} className="text-slate-400">✕</button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs">
              <span className="font-bold text-amber-900 block mb-0.5">ملاحظات التعديل المطلوبة من العميل:</span>
              <p className="text-slate-700">{selectedProof.revisionNote || "لا توجد تفاصيل"}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط الملف المعدل الجديد (v{(selectedProof.version || 1) + 1})</label>
              <input
                type="text"
                required
                placeholder="https://res.cloudinary.com/.../proof_v2.pdf"
                value={revisionFileUrl}
                onChange={(e) => setRevisionFileUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">توضيح التعديلات المنفذة (للملاحظة)</label>
              <textarea
                rows={2}
                placeholder="تم تعديل اللون وضبط هوامش الطباعة..."
                value={revisionComment}
                onChange={(e) => setRevisionComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-2xl text-xs shadow-md"
            >
              {submitting ? "جاري الرفع..." : "حفظ ورفع التعديل للعميل ←"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
