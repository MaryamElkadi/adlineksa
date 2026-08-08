'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  productId: string;
  productName: string;
  image?: string;
  size?: string;
  material?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customNotes?: string;
}

interface Order {
  _id: string;
  id?: string;
  number?: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  total: number;
  step?: number;
  status:
    | "Pending"
    | "In Production"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "تم التوصيل"
    | "قيد التنفيذ";
  trackingDetails?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    notes?: string;
  };
}

interface QuoteRequest {
  _id: string;
  number?: string;
  date: string;
  title?: string;
  specs?: string;
  name?: string;
  category?: string;
  material?: string;
  quantity: number;
  width?: number;
  height?: number;
  details?: string;
  status:
    | "Pending"
    | "Reviewed"
    | "Quoted"
    | "Accepted"
    | "Rejected"
    | "تم التسعير"
    | "قيد الدراسة"
    | "مرفوض";
  quotationPrice?: number;
  priceOffer?: number;
}

interface Ticket {
  _id: string;
  ticketNumber?: string;
  subject: string;
  category: string;
  message: string;
  status:
    | "Open"
    | "In Progress"
    | "Resolved"
    | "Closed"
    | "مفتوحة"
    | "قيد المراجعة"
    | "مغلقة";
  priority?: "Low" | "Medium" | "High";
  adminReply?: string;
  date: string;
}

interface Artwork {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  type?: "library" | "proof";
  proofStatus?:
    | "pending"
    | "approved"
    | "revision_requested";
  revisionNote?: string;
  orderId?: string | null;
  createdAt?: string;
}

type TabType = 'orders' | 'quotes' | 'proofs' | 'artworks' | 'tickets';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [proofs, setProofs] = useState<Artwork[]>([]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  } | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState<boolean>(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadingArtwork, setUploadingArtwork] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit profile state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setEditFirstName(parsed.firstName || '');
        setEditLastName(parsed.lastName || '');
        setEditEmail(parsed.email || '');
      } catch (e) {
        console.error('Failed to parse cached user details', e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        const [
          ordersRes,
          quotesRes,
          ticketsRes,
          proofsRes,
          artworksRes,
        ] = await Promise.all([
          fetch("/api/orders", { credentials: "include" }),
          fetch("/api/quotes", { credentials: "include" }),
          fetch("/api/tickets", { credentials: "include" }),
          fetch("/api/proofs", { credentials: "include" }),
          fetch("/api/artworks", { credentials: "include" }),
        ]);

        const ordersData = ordersRes.ok ? await ordersRes.json() : [];
        const quotesData = quotesRes.ok ? await quotesRes.json() : [];
        const ticketsData = ticketsRes.ok ? await ticketsRes.json() : [];
        const proofsData = proofsRes.ok ? await proofsRes.json() : [];
        const artworksData = artworksRes.ok ? await artworksRes.json() : [];

        setOrders(
          Array.isArray(ordersData)
            ? ordersData.map((ord: any) => ({
                ...ord,
                number: ord.number || ord.orderNumber || `ORD-${ord._id?.slice(-4) || '0000'}`,
                step: ord.step || (ord.status === 'Delivered' || ord.status === 'تم التوصيل' ? 4 : 2),
              }))
            : []
        );

        setQuotes(
          Array.isArray(quotesData)
            ? quotesData.map((q: any) => ({
                _id: q._id,
                number: q.number || `RFQ-${q._id?.slice(-4) || ""}`,
                date: q.createdAt
                  ? new Date(q.createdAt).toISOString().slice(0, 10)
                  : q.date || "",
                title: q.title || q.productType || "طلب تسعير",
                specs: q.specs || q.notes || q.material || "لا توجد مواصفات",
                quantity: q.quantity || 0,
                status:
                  q.status === "Quoted" || q.status === "تم التسعير"
                    ? "تم التسعير"
                    : q.status === "Rejected" || q.status === "مرفوض"
                    ? "مرفوض"
                    : "قيد الدراسة",
                priceOffer: q.priceOffer || q.quotationPrice || q.estimatedPrice,
              }))
            : []
        );

        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setProofs(Array.isArray(proofsData) ? proofsData : []);
        setArtworks(Array.isArray(artworksData) ? artworksData : []);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Updated Dynamic Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditProfileOpen(false);
      showToast('تم حفظ بيانات الملف الشخصي بنجاح!');
    } catch (error) {
      console.error(error);
      showToast('حدث خطأ أثناء تحديث الملف الشخصي');
    }
  };

  // Dynamic Artwork Upload Handler
  const handleArtworkUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingArtwork(true);
      const response = await fetch("/api/artworks", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const artwork = await response.json();
      setArtworks((prev) => [artwork, ...prev]);
      setIsUploadOpen(false);
      showToast("تم رفع التصميم بنجاح!");
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء رفع التصميم");
    } finally {
      setUploadingArtwork(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleApproveProof = async (proofId: string) => {
    try {
      const response = await fetch(
        `/api/proofs/${proofId}/approve`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve proof");
      }

      const updatedProof = await response.json();

      setProofs((prev) =>
        prev.map((proof) =>
          proof._id === proofId ? updatedProof : proof
        )
      );

      showToast("تم اعتماد البروفة بنجاح!");
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء اعتماد البروفة");
    }
  };

  const handleCreateQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("/api/quotes", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          specs: formData.get("specs"),
          quantity: Number(formData.get("quantity")),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create quote");
      }

      const createdQuote = await response.json();
      setQuotes((prev) => [createdQuote, ...prev]);
      setIsNewQuoteOpen(false);
      showToast("تم إرسال طلب التسعير بنجاح!");
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء إرسال طلب التسعير");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("/api/tickets", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: formData.get("subject"),
          category: formData.get("category"),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const createdTicket = await response.json();
      setTickets((prev) => [createdTicket, ...prev]);
      setIsNewTicketOpen(false);
      showToast("تم إنشاء تذكرة الدعم بنجاح!");
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء إنشاء التذكرة");
    }
  };

  const renderOrderItems = (items: string | OrderItem[]) => {
    if (typeof items === 'string') {
      return <span className="text-xs font-bold text-slate-700">{items}</span>;
    }

    if (Array.isArray(items) && items.length > 0) {
      return (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.productId || index} className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2 last:border-0">
              <div className="flex justify-between">
                <span>{item.productName}</span>
                <span>{item.quantity} × {item.unitPrice} ر.س</span>
              </div>
              {item.size && <div className="text-slate-500 font-normal">المقاس: {item.size}</div>}
              {item.material && <div className="text-slate-500 font-normal">المادة: {item.material}</div>}
              {item.customNotes && <div className="text-slate-500 font-normal text-xs">ملاحظات: {item.customNotes}</div>}
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-xs font-bold text-slate-700">لا توجد منتجات</span>;
  };

  const getItemsAsString = (items: string | OrderItem[]): string => {
    if (typeof items === 'string') return items;
    if (Array.isArray(items)) {
      return items.map(item => `${item.productName} (${item.quantity})`).join('، ');
    }
    return '';
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-right font-sans relative">
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-amber-400 flex items-center gap-3 animate-bounce">
          <span>✨</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* User Header */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-sky-50/50 border border-amber-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-900 font-black text-2xl flex items-center justify-center shadow-md">
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {user ? `${user.firstName} ${user.lastName}` : 'زائر'}
            </h2>
            <p className="text-slate-500 font-medium">
              {user?.email || 'guest@email.com'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          <Badge variant="yellow" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
            عضوية الشركات Enterprise ✨
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsEditProfileOpen(true)}
            className="font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            تعديل الملف الشخصي
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: 'orders' as TabType, label: '📦 الطلبات والتتبع' },
          { id: 'quotes' as TabType, label: '🏷️ طلبات التسعير (RFQ)' },
          { id: 'proofs' as TabType, label: `🔍 مراجعة التصاميم ${proofs.length > 0 ? `(${proofs.length})` : ''}` },
          { id: 'artworks' as TabType, label: `📁 مكتبة التصاميم ${artworks.length > 0 ? `(${artworks.length})` : ''}` },
          { id: 'tickets' as TabType, label: `💬 تذاكر الدعم الفني ${tickets.length > 0 ? `(${tickets.length})` : ''}` },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tb.id
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">أعمال الطباعة الحالية والسابقة</h2>
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium">جاري تحميل الطلبات...</div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">لا توجد طلبات حصرية حالياً.</div>
          ) : (
            orders.map((ord) => (
              <div key={ord._id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black text-amber-600">{ord.number || ord.orderNumber}</span>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">تم الطلب بتاريخ {ord.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ord.status === 'تم التوصيل' || ord.status === 'Delivered' ? 'green' : 'yellow'} className={ord.status === 'تم التوصيل' || ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                      {ord.status}
                    </Badge>
                    <span className="text-sm font-black text-slate-900">{ord.total} ر.س</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-700">
                  {renderOrderItems(ord.items)}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span className={(ord.step || 1) >= 1 ? 'text-amber-600 font-black' : ''}>1. تم الاستلام</span>
                    <span className={(ord.step || 1) >= 2 ? 'text-amber-600 font-black' : ''}>2. قيد المراجعة</span>
                    <span className={(ord.step || 1) >= 3 ? 'text-amber-600 font-black' : ''}>3. جاري الطباعة</span>
                    <span className={(ord.step || 1) >= 4 ? 'text-amber-600 font-black' : ''}>4. تم التوصيل</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 shadow-2xs"
                      style={{ width: `${((ord.step || 1) / 4) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedInvoice(ord)}
                    className="font-bold text-xs bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    📄 تحميل الفاتورة PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedOrder(ord)}
                    className="font-bold text-xs bg-amber-400 hover:bg-amber-500 text-slate-900 border-0 cursor-pointer"
                  >
                    📍 متابعة الشحنة والطلب
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showToast(`تم إضافة المنتجات للطلب (${ord.number || ord.orderNumber}) إلى سلة التسوق لطلبها مجدداً!`)}
                    className="font-bold text-xs border-amber-300 text-amber-900 hover:bg-amber-50 cursor-pointer"
                  >
                    🔄 إعادة طلب هذا المنتج
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Quotes */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">طلبات التسعير الخاصة (RFQ)</h2>
            <Button
              size="sm"
              onClick={() => setIsNewQuoteOpen(true)}
              className="font-black text-slate-900 bg-amber-400 hover:bg-amber-500 border-0 cursor-pointer"
            >
              + طلب تسعير جديد
            </Button>
          </div>

          {quotes.map((q) => (
            <div key={q._id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-600">{q.number}</span>
                    <span className="text-xs font-bold text-slate-400">• {q.date}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-1">{q.title}</h3>
                </div>
                <Badge className={q.status === 'تم التسعير' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                  {q.status}
                </Badge>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-xs">
                <p className="text-slate-600 font-medium">المواصفات المطلوب تسعيرها: <span className="font-bold text-slate-800">{q.specs}</span></p>
                <p className="text-slate-600 font-medium">الكمية المطلوبة: <span className="font-bold text-slate-800">{(q.quantity || 0).toLocaleString()} قطعة</span></p>
              </div>

              {q.status === 'تم التسعير' && q.priceOffer && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-amber-50/60 p-4 rounded-2xl border border-amber-200 gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block">عرض السعر المقدم من المطبعة:</span>
                    <span className="text-lg font-black text-slate-900">{q.priceOffer.toLocaleString()} ر.س</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => showToast(`تم تحويل طلب التسعير (${q.number}) إلى طلب مؤكد وجاري تجهيز الفاتورة!`)}
                    className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    🛒 تحويل لطلب مباشر والدفع
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Proofs */}
      {activeTab === 'proofs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-black text-slate-900">التصاميم بانتظار موافقتك 🔍</h2>

          {proofs.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">لا توجد بروفات تصاميم معلقة حالياً.</p>
          ) : (
            proofs.map((proof) => (
              <div key={proof._id} className="border border-amber-300 bg-amber-50/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{proof.name || "بروفة تصميم"}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    {proof.description || "يرجى التأكد من محاذاة الفويل الذهبي وهامش القَص وألوان CMYK قبل البدء في مرحلة الإنتاج."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveProof(proof._id)}
                    className="font-black text-slate-800 bg-amber-400 hover:bg-amber-500 border-0 shadow-xs cursor-pointer"
                  >
                    ✓ الاعتماد والموافقة
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const note = prompt('اكتب ملاحظات التعديل المطلوبة:');
                      if (note) {
                        showToast('تم تقديم طلب التعديل لفريق التصميم!');
                      }
                    }}
                    className="font-bold border-slate-300 text-slate-700 bg-white cursor-pointer"
                  >
                    طلب تعديل
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Artworks */}
      {activeTab === 'artworks' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">ملفات التصاميم المحفوظة الخاصة بك</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                ملفات PDF عالية الدقة والشعارات المتجهة والقوالب المخصصة المحفوظة ليسهل عليك إعادة طلبها بنقرة واحدة.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="font-black text-amber-900 bg-amber-100 border-amber-300 hover:bg-amber-200 cursor-pointer whitespace-nowrap"
            >
              + رفع تصميم جديد (Vector / PDF)
            </Button>
          </div>

          {artworks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="text-4xl mb-2">📁</div>
              لا توجد تصاميم مرفوعة حالياً. اضغط على أزرار الرفع لإضافة تصميم جديد.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artworks.map((art) => (
                <div key={art._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 relative group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      {art.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-black text-slate-900 truncate">{art.name || art.fileName}</h4>
                      <p className="text-[11px] text-slate-400">{art.createdAt ? new Date(art.createdAt).toLocaleDateString('ar-EG') : 'الآن'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">الحجم: {art.fileSize ? `${(art.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'غير معروف'}</span>
                    <a
                      href={art.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-amber-600 hover:text-amber-700 underline text-xs"
                    >
                      معاينة / تحميل
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Tickets */}
      {activeTab === 'tickets' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">تذاكر الدعم الفني 💬</h2>
            <Button
              size="sm"
              onClick={() => setIsNewTicketOpen(true)}
              className="font-black text-slate-800 bg-amber-400 hover:bg-amber-500 border-0 shadow-xs cursor-pointer"
            >
              + تذكرة جديدة
            </Button>
          </div>

          {tickets.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">لا توجد تذاكر دعم نشطة حالياً.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{t.subject}</h4>
                    <p className="text-xs text-slate-500">{t.category} • {t.date}</p>
                    <p className="text-xs text-slate-600 mt-1">{t.message}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-900">{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Upload Artwork */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">رفع تصميم جديد</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 rounded-2xl p-8 text-center cursor-pointer space-y-3 transition-all"
            >
              <div className="text-4xl">📤</div>
              <div className="text-xs font-bold text-slate-700">
                {uploadingArtwork ? "جاري رفع الملف..." : "اضغط هنا لاختيار ملف التصميم من جهازك"}
              </div>
              <p className="text-[10px] text-slate-400">الصيغ المدعومة: .pdf, .ai, .eps, .psd</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ai,.eps,.psd"
                className="hidden"
                onChange={handleArtworkUpload}
                disabled={uploadingArtwork}
              />
            </div>

            <Button
              onClick={() => setIsUploadOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl cursor-pointer"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Edit Profile */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">تعديل الملف الشخصي</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">الاسم الأول</label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block mb-1">الاسم الأخير</label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-2xl cursor-pointer">
                  حفظ التغيرات
                </Button>
                <Button type="button" onClick={() => setIsEditProfileOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl cursor-pointer">
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Selected Order Tracking */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">متابعة حالة الطلب</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  رقم الطلب: <span className="text-amber-600 font-bold">{selectedOrder.number || selectedOrder.orderNumber}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-bold transition-all flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">المنتجات:</span>
                  <span className="font-bold text-slate-800">{getItemsAsString(selectedOrder.items)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ الطلب:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المبلغ الإجمالي:</span>
                  <span className="font-bold text-amber-600">{selectedOrder.total} ر.س</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-black text-slate-900 text-sm">تفاصيل الشحن والتوصيل</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-600">شركة الشحن:</span>
                    <span className="font-bold text-slate-900">{selectedOrder.trackingDetails?.carrier || 'سمسا اكسبريس (SMSA)'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-600">رقم التتبع:</span>
                    <span dir="ltr" className="font-mono font-bold text-amber-700">{selectedOrder.trackingDetails?.trackingNumber || 'SMSA-9920148'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-600">الموعد المتوقع للتسليم:</span>
                    <span className="font-bold text-emerald-700">{selectedOrder.trackingDetails?.estimatedDelivery || '2026-07-28'}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl cursor-pointer"
            >
              إغلاق النافذة
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Invoice */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">الفاتورة الضريبية المبسطة 📄</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">رقم الفاتورة: #{selectedInvoice.number || selectedInvoice.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">العميل:</span>
                <span className="font-bold text-slate-800">{user ? `${user.firstName} ${user.lastName}` : 'زائر'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">التاريخ:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">إجمالي المنتجات:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.total} ر.س</span>
              </div>
              <div className="flex justify-between pt-1 font-black text-sm">
                <span className="text-slate-900">المبلغ الإجمالي المدفوع:</span>
                <span className="text-amber-600">{selectedInvoice.total} ر.س</span>
              </div>
            </div>

            <Button
              onClick={() => setSelectedInvoice(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl cursor-pointer"
            >
              إغلاق
            </Button>
          </div>
        </div>
      )}

      {/* Modal: New Quote */}
      {isNewQuoteOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">طلب تسعير جديد (RFQ)</h3>
              <button onClick={() => setIsNewQuoteOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">عنوان الطلب / نوع المنتج</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="مثال: علب كرتون فاخرة"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block mb-1">المواصفات المطلوبة</label>
                <textarea
                  name="specs"
                  required
                  rows={3}
                  placeholder="المقاس، نوع الورق، التكسير، الطباعة الداخلية..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="block mb-1">الكمية المطلوبة</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="1000"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-2xl cursor-pointer">
                  إرسال الطلب
                </Button>
                <Button type="button" onClick={() => setIsNewQuoteOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl cursor-pointer">
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Ticket */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">تذكرة دعم جديدة</h3>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">موضوع التذكرة</label>
                <input
                  name="subject"
                  type="text"
                  required
                  placeholder="استفسار عن الشحنة..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block mb-1">القسم</label>
                <select
                  name="category"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400"
                >
                  <option value="الطلبات والشحن">الطلبات والشحن</option>
                  <option value="التصاميم والبروفات">التصاميم والبروفات</option>
                  <option value="الحسابات والفواتير">الحسابات والفواتير</option>
                  <option value="عام">عام</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">تفاصيل الرسالة</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="اكتب استفسارك هنا..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-2xl cursor-pointer">
                  إنشاء التذكرة
                </Button>
                <Button type="button" onClick={() => setIsNewTicketOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl cursor-pointer">
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}