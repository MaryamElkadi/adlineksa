"use client";

import { useEffect, useState } from "react";

interface Quotation {
  id: string;
  company: string;
  name: string;
  phone: string;
  email: string;
  city?: string;

  category: string;
  quantity: string | number;
  width?: string;
  height?: string;
  material?: string;
  deliveryDate?: string;
  details?: string;
  fileUrl?: string;

  quotationPrice: number;
  status: string;
  createdAt: string;
  adminNotes?: string;
}

const statusColor = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-300",
  Reviewed: "bg-blue-100 text-blue-800 border border-blue-300",
  Quoted: "bg-purple-100 text-purple-800 border border-purple-300",
  Accepted: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  Rejected: "bg-rose-100 text-rose-800 border border-rose-300",
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Quotation | null>(null);

  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/quotations");
      const data = await res.json();
      setQuotations(data);
    } catch {
      alert("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveQuotation() {
    if (!selected) return;

    const res = await fetch(`/api/quotations/${selected.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quotationPrice: Number(price),
        adminNotes: notes,
        status,
      }),
    });

    if (!res.ok) {
      alert("فشل تحديث البيانات");
      return;
    }

    alert("تم تحديث طلب التسعير بنجاح");
    setSelected(null);
    loadData();
  }

  async function deleteQuotation(id: string) {
    if (!confirm("هل أنت تأكد من حذف طلب التسعير هذا؟")) return;

    await fetch(`/api/quotations/${id}`, {
      method: "DELETE",
    });

    loadData();
  }

  return (
    <div dir="rtl" className="space-y-8 p-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">طلبات التسعير (B2B)</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            عرض ومراجعة كافة مواصفات طلبات العملاء والشركات.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 px-6 py-3 shadow-xs flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500">إجمالي الطلبات</span>
          <span className="text-3xl font-black text-amber-500">{quotations.length}</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-700 text-xs font-black border-b border-slate-200">
              <tr>
                <th className="p-4">العميل والشركة</th>
                <th className="p-4">التواصل والمدينة</th>
                <th className="p-4">المنتج والكمية</th>
                <th className="p-4">الأبعاد والخامة</th>
                <th className="p-4">السعر</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400">
                    لا توجد طلبات تسعير حالياً.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer & Company */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{q.name}</div>
                      <div className="text-slate-500 text-[11px]">{q.company || "شركة غير محددة"}</div>
                    </td>

                    {/* Contact & City */}
                    <td className="p-4">
                      <div dir="ltr" className="text-right text-slate-700 font-semibold">{q.phone}</div>
                      <div className="text-slate-500 text-[11px]">{q.email}</div>
                      {q.city && <div className="text-amber-600 text-[10px] font-bold">📍 {q.city}</div>}
                    </td>

                    {/* Category & Quantity */}
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{q.category}</div>
                      <div className="text-slate-500">الكمية: <span className="font-bold text-slate-700">{q.quantity}</span></div>
                    </td>

                    {/* Dimensions & Material */}
                    <td className="p-4">
                      {q.width || q.height ? (
                        <div className="text-slate-700 font-mono text-[11px]">
                          {q.width || "-"} × {q.height || "-"} سم
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">غير مخصص</div>
                      )}
                      {q.material && <div className="text-slate-500 text-[11px] truncate max-w-[120px]">{q.material}</div>}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-bold text-sm text-slate-900">
                      {q.quotationPrice > 0 ? (
                        <span className="text-emerald-600">{q.quotationPrice} ر.س</span>
                      ) : (
                        <span className="text-slate-400 font-normal">لم يحدد</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          statusColor[q.status as keyof typeof statusColor] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
                          onClick={() => {
                            setSelected(q);
                            setPrice(q.quotationPrice ? q.quotationPrice.toString() : "");
                            setNotes(q.adminNotes || "");
                            setStatus(q.status || "Pending");
                          }}
                        >
                          معاينة وتعديل
                        </button>

                        <button
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                          onClick={() => deleteQuotation(q.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Details & Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">تفاصيل طلب التسعير</h2>
                <p className="text-xs text-slate-500">رقم الطلب: {selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Display All Submitted Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">الشركة / الجهة:</span>
                <span className="font-bold text-slate-800">{selected.company || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">اسم المسؤول:</span>
                <span className="font-bold text-slate-800">{selected.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الجوال:</span>
                <span dir="ltr" className="font-bold text-slate-800 inline-block">{selected.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">البريد الإلكتروني:</span>
                <span className="font-bold text-slate-800">{selected.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">المدينة:</span>
                <span className="font-bold text-slate-800">{selected.city || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">التصنيف والكمية:</span>
                <span className="font-bold text-slate-800">{selected.category} ({selected.quantity})</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">المقاسات (عرض × ارتفاع):</span>
                <span className="font-bold text-slate-800">
                  {selected.width || "-"} × {selected.height || "-"} سم
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الخامة المطلوبة:</span>
                <span className="font-bold text-slate-800">{selected.material || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">موعد التسليم المستهدف:</span>
                <span className="font-bold text-slate-800">{selected.deliveryDate || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">تاريخ إرسال الطلب:</span>
                <span className="font-bold text-slate-800">
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("ar-SA") : "-"}
                </span>
              </div>

              {/* Full Details / Notes from Client */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                <span className="text-slate-400 block mb-1 font-bold">تفاصيل وتوجيهات المشروع:</span>
                <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {selected.details || "لا توجد تفاصيل إضافية."}
                </p>
              </div>

              {/* File Attachment Link */}
              {selected.fileUrl && (
                <div className="sm:col-span-2">
                  <a
                    href={selected.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-amber-700 bg-amber-100 hover:bg-amber-200 font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    📎 معاينة / تحميل التصميم المرفق
                  </a>
                </div>
              )}
            </div>

            {/* Admin Management Inputs */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-black text-slate-900">تحديث حالة وسعر الطلب</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عرض السعر (ر.س)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-amber-400"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    حالة الطلب
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-amber-400"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending (قيد الانتظار)</option>
                    <option value="Reviewed">Reviewed (تمت المراجعة)</option>
                    <option value="Quoted">Quoted (تم التسعير)</option>
                    <option value="Accepted">Accepted (تم القبول)</option>
                    <option value="Rejected">Rejected (مرفوض)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات الإدارة (داخلي)
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-amber-400 resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل ملاحظات الإدارة الفنية أو الخاصة بالمبيعات..."
                />
              </div>

              <button
                onClick={saveQuotation}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-500 font-black py-3.5 text-slate-900 text-sm shadow-md transition-all cursor-pointer"
              >
                حفظ التعديلات والتحديث
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}