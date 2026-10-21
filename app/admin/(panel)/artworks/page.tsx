"use client";

import { useEffect, useState } from "react";

interface Artwork {
  _id: string;
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  userId: string;
  createdAt: string;
}

interface UserItem {
  _id: string;
  fullName: string;
  email: string;
}

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [artworksRes, usersRes] = await Promise.all([
        fetch("/api/artworks?admin=true"),
        fetch("/api/users"),
      ]);

      const artworksData = artworksRes.ok ? await artworksRes.json() : [];
      const usersData = usersRes.ok ? await usersRes.json() : [];

      setArtworks(Array.isArray(artworksData) ? artworksData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch {
      alert("فشل تحميل المكتبة");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUserId || !name || !fileUrl) {
      alert("يرجى تحديد العميل، اسم الملف، ورابط التحميل.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          name,
          fileUrl,
          fileName: name,
        }),
      });

      if (!res.ok) throw new Error("فشل الرفع");

      alert("تم إضافة الملف إلى مكتبة تصاميم العميل بنجاح!");
      setIsUploadOpen(false);
      setName("");
      setFileUrl("");
      loadData();
    } catch {
      alert("حدث خطأ أثناء إضافة التصميم.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir="rtl" className="space-y-8 p-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 block mb-1">إدارة الأصول والتصاميم المرفوعة</span>
          <h1 className="text-3xl font-black text-slate-900">مكتبة التصاميم الشاملة (Artworks)</h1>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-md transition-all cursor-pointer"
        >
          + إضافة تصميم لمكتبة عميل
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h2 className="text-lg font-black text-slate-900">جميع تصاميم العملاء ({artworks.length})</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium">جاري تحميل البيانات...</div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">لا توجد تصاميم محفوظة حالياً.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((art) => (
              <div key={art._id} className="border border-slate-200 rounded-3xl p-5 space-y-3 bg-slate-50/60 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                    {art.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                  </div>
                  <div className="truncate">
                    <h3 className="font-black text-sm text-slate-900 truncate">{art.name}</h3>
                    <p className="text-[11px] text-slate-400">{art.createdAt ? new Date(art.createdAt).toLocaleDateString("ar-SA") : ""}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">الحجم: {art.fileSize ? `${(art.fileSize / (1024 * 1024)).toFixed(2)} MB` : "—"}</span>
                  <a
                    href={art.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-amber-700 underline text-xs"
                  >
                    معاينة / تحميل الملف 📎
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpload} className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">إضافة تصميم لمكتبة عميل</h3>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم/عنوان التصميم</label>
              <input
                type="text"
                required
                placeholder="مثال: شعار المتجر الرئيسي Vector"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط التحميل Direct File URL</label>
              <input
                type="text"
                required
                placeholder="https://res.cloudinary.com/.../logo.ai"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-2xl text-xs shadow-md"
            >
              {submitting ? "جاري الإضافة..." : "حفظ إضافة التصميم ←"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
