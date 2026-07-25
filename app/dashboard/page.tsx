'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Order {
  _id: string;
  number: string;
  date: string;
  items: string;
  total: number;
  status: string;
  step: number;
  trackingDetails?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    notes?: string;
  };
}

interface QuoteRequest {
  _id: string;
  number: string;
  date: string;
  title: string;
  specs: string;
  quantity: number;
  status: 'قيد الدراسة' | 'تم التسعير' | 'مرفوض';
  priceOffer?: number;
}

type TabType = 'orders' | 'quotes' | 'proofs' | 'artworks' | 'tickets';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [quotes, setQuotes] = useState<QuoteRequest[]>([
    {
      _id: 'q1',
      number: 'RFQ-8801',
      date: '2026-07-20',
      title: 'علب كرتونية فاخرة مخصصة للمقاهي',
      specs: 'كرتون كرافت 350g • طباعة سيريجرافيك ذهبي • مقاس 20x15cm',
      quantity: 5000,
      status: 'تم التسعير',
      priceOffer: 12500,
    },
    {
      _id: 'q2',
      number: 'RFQ-8802',
      date: '2026-07-24',
      title: 'أكياس ورقية مطبوعة بالكامل',
      specs: 'ورق كوشيه 200g • يديات قماشية • طباعة أوفست 4 ألوان',
      quantity: 10000,
      status: 'قيد الدراسة',
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState<boolean>(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [proofStatus, setProofStatus] = useState<'pending' | 'approved' | 'revision_requested'>('pending');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          setOrders([
            {
              _id: 'ord1',
              number: 'ORD-9901',
              date: '2026-07-15',
              items: 'كروت شخصية بصبغة ذهبية + بروشورات A4',
              total: 850,
              status: 'جاري الطباعة',
              step: 3,
              trackingDetails: {
                carrier: 'سمسا اكسبريس (SMSA)',
                trackingNumber: 'SMSA-9920148',
                estimatedDelivery: '2026-07-28',
              },
            },
            {
              _id: 'ord2',
              number: 'ORD-9882',
              date: '2026-06-10',
              items: 'رول أب ستاند 85x200cm + لوحات كانفاس',
              total: 1400,
              status: 'تم التوصيل',
              step: 4,
              trackingDetails: {
                carrier: 'أرامكس (Aramex)',
                trackingNumber: 'ARMX-331092',
                estimatedDelivery: '2026-06-13',
              },
            },
          ]);
        }
      } catch (err) {
        console.error('فشل في جلب البيانات من قاعدة البيانات', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleCreateQuote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQ: QuoteRequest = {
      _id: Date.now().toString(),
      number: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      title: formData.get('title') as string,
      specs: formData.get('specs') as string,
      quantity: Number(formData.get('quantity')),
      status: 'قيد الدراسة',
    };
    setQuotes([newQ, ...quotes]);
    setIsNewQuoteOpen(false);
    showToast('تم إرسال طلب التسعير بنجاح! سيتم الرد خلال 24 ساعة.');
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
            س
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">سامي العتيبي</h1>
            <p className="text-xs text-slate-500 font-medium">sami@company.sa • حساب تجاري سعودي</p>
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

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: 'orders' as TabType, label: '📦 الطلبات والتتبع' },
          { id: 'quotes' as TabType, label: '🏷️ طلبات التسعير (RFQ)' },
          { id: 'proofs' as TabType, label: `🔍 مراجعة التصاميم ${proofStatus === 'pending' ? '(1 بانتظار الموافقة)' : ''}` },
          { id: 'artworks' as TabType, label: '📁 مكتبة التصاميم' },
          { id: 'tickets' as TabType, label: '💬 تذاكر الدعم الفني' },
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

      {/* Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">أعمال الطباعة الحالية والسابقة</h2>
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium">جاري تحميل الطلبات...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">لا توجد طلبات حصرية حالياً.</div>
          ) : (
            orders.map((ord) => (
              <div key={ord._id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black text-amber-600">{ord.number}</span>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">تم الطلب بتاريخ {ord.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ord.status === 'تم التوصيل' ? 'green' : 'yellow'} className={ord.status === 'تم التوصيل' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                      {ord.status}
                    </Badge>
                    <span className="text-sm font-black text-slate-900">{ord.total} ر.س</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-700">{ord.items}</div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span className={ord.step >= 1 ? 'text-amber-600 font-black' : ''}>1. تم الاستلام</span>
                    <span className={ord.step >= 2 ? 'text-amber-600 font-black' : ''}>2. قيد المراجعة</span>
                    <span className={ord.step >= 3 ? 'text-amber-600 font-black' : ''}>3. جاري الطباعة</span>
                    <span className={ord.step >= 4 ? 'text-amber-600 font-black' : ''}>4. تم التوصيل</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 shadow-2xs"
                      style={{ width: `${(ord.step / 4) * 100}%` }}
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
                    onClick={() => showToast(`تم إضافة المنتجات للطلب (${ord.number}) إلى سلة التسوق لطلبها مجدداً!`)}
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

      {/* Quotes Tab */}
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
                <p className="text-slate-600 font-medium">الكمية المطلوبة: <span className="font-bold text-slate-800">{q.quantity.toLocaleString()} قطعة</span></p>
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

      {/* Proofs Tab */}
      {activeTab === 'proofs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-black text-slate-900">التصاميم بانتظار موافقتك 🔍</h2>
          
          {proofStatus === 'approved' ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
              <span className="text-3xl">🎉</span>
              <h3 className="font-black text-emerald-900 text-sm">تمت الموافقة على بروفات التصميم بنجاح!</h3>
              <p className="text-xs text-emerald-700">تم إرسال الملفات تلقائياً إلى خط الطباعة والإنتاج.</p>
            </div>
          ) : proofStatus === 'revision_requested' ? (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center space-y-2">
              <span className="text-3xl">📝</span>
              <h3 className="font-black text-amber-900 text-sm">تم إرسال ملاحظات التعديل إلى المصمم</h3>
              <p className="text-xs text-amber-700">سيتم رفع البروفة المعدلة للراجعة خلال ساعتين عمل.</p>
            </div>
          ) : (
            <div className="border border-amber-300 bg-amber-50/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">بروفا متجهية رقم #1</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  يرجى التأكد من محاذاة الفويل الذهبي وهامش القَص وألوان CMYK قبل البدء في مرحلة الإنتاج.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => {
                    setProofStatus('approved');
                    showToast('تم اعتماد البروفة بنجاح وإرسالها للإنتاج!');
                  }}
                  className="font-black !text-slate-800 bg-amber-400 hover:bg-amber-500 border-0 shadow-xs cursor-pointer"
                >
                  ✓ الاعتماد والموافقة
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => {
                    const note = prompt('اكتب ملاحظات التعديل المطلوبة:');
                    if (note) {
                      setProofStatus('revision_requested');
                      showToast('تم تقديم طلب التعديل لفريق التصميم!');
                    }
                  }}
                  className="font-bold border-slate-300 text-slate-700 bg-white cursor-pointer"
                >
                  طلب تعديل
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Artworks Tab */}
      {activeTab === 'artworks' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <div className="text-5xl animate-bounce">📁</div>
          <h3 className="text-lg font-black text-slate-900">ملفات التصاميم المحفوظة الخاصة بك</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
            ملفات PDF عالية الدقة والشعارات المتجهة والقوالب المخصصة المحفوظة ليسهل عليك إعادة طلبها بنقرة واحدة.
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsUploadOpen(true)}
            className="font-black text-amber-900 bg-amber-100 border-amber-300 hover:bg-amber-200 cursor-pointer"
          >
            + رفع تصميم جديد (Vector / PDF)
          </Button>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">تذاكر الدعم الفني 💬</h2>
            <Button 
              size="sm" 
              onClick={() => setIsNewTicketOpen(true)}
              className="font-black !text-slate-800 bg-amber-400 hover:bg-amber-500 border-0 shadow-xs cursor-pointer"
            >
              + تذكرة جديدة
            </Button>
          </div>
          <p className="text-xs text-slate-400 font-semibold">لا توجد تذاكر دعم نشطة حالياً.</p>
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">متابعة حالة الطلب</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  رقم الطلب: <span className="text-amber-600 font-bold">{selectedOrder.number}</span>
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
                  <span className="font-bold text-slate-800">{selectedOrder.items}</span>
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
                    <span className="font-bold text-slate-900">{selectedOrder.trackingDetails?.carrier || "سمسا اكسبريس (SMSA)"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-600">رقم التتبع:</span>
                    <span dir="ltr" className="font-mono font-bold text-amber-700">{selectedOrder.trackingDetails?.trackingNumber || "SMSA-9920148"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    <span className="text-slate-600">الموعد المتوقع للتسليم:</span>
                    <span className="font-bold text-emerald-700">{selectedOrder.trackingDetails?.estimatedDelivery || "2026-07-28"}</span>
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

      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">الفاتورة الضريبية المبسطة 📄</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">رقم الفاتورة: #{selectedInvoice.number}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">اسم العميل:</span><span className="font-bold">سامي العتيبي</span></div>
              <div className="flex justify-between"><span className="text-slate-500">التاريخ:</span><span className="font-bold">{selectedInvoice.date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">المنتج:</span><span className="font-bold">{selectedInvoice.items}</span></div>
              <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900"><span>الإجمالي:</span><span>{selectedInvoice.total} ر.س</span></div>
            </div>

            <div className="flex gap-2">
              <Button 
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2.5 rounded-xl cursor-pointer"
                onClick={() => {
                  showToast('جاري بدء تحميل ملف الفاتورة PDF...');
                  setSelectedInvoice(null);
                }}
              >
                📥 تنزيل الفاتورة PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {isNewQuoteOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-4 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">تقديم طلب تسعير خاص (RFQ) 🏷️</h3>
              <button onClick={() => setIsNewQuoteOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">اسم المشروع / المنتج:</label>
                <input required name="title" placeholder="مثال: علب التغليف الفاخرة" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-amber-400" />
              </div>
              <div>
                <label className="block mb-1">المواصفات الفنية والتفاصيل:</label>
                <textarea required name="specs" rows={3} placeholder="نوع الورق، السُمك، نوع الطباعة..." className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-amber-400" />
              </div>
              <div>
                <label className="block mb-1">الكمية المطلوبة:</label>
                <input required type="number" name="quantity" defaultValue={1000} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-amber-400" />
              </div>
              <Button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-xl cursor-pointer">
                إرسال الطلب للمراجعة
              </Button>
            </form>
          </div>
        </div>
      )}

      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-4 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">تعديل الملف الشخصي 👤</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block mb-1">الاسم الكامل:</label>
                <input defaultValue="سامي العتيبي" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <div>
                <label className="block mb-1">البريد الإلكتروني:</label>
                <input defaultValue="sami@company.sa" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <Button 
                onClick={() => {
                  setIsEditProfileOpen(false);
                  showToast('تم حفظ بيانات الملف الشخصي بنجاح!');
                }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2.5 rounded-xl cursor-pointer"
              >
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </div>
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-4 relative border border-slate-100 text-center">
            <h3 className="text-lg font-black text-slate-900">رفع تصميم جديد 📁</h3>
            <div className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 rounded-2xl cursor-pointer">
              <span className="text-3xl block mb-2">☁️</span>
              <p className="text-xs text-slate-600 font-bold">اضغط هنا لاختيار ملف (PDF, AI, PSD, EPS)</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setIsUploadOpen(false);
                  showToast('تم رفع ملف التصميم وحفظه في المكتبة!');
                }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2.5 rounded-xl cursor-pointer"
              >
                تأكيد الرفع
              </Button>
              <Button onClick={() => setIsUploadOpen(false)} variant="secondary" className="w-full">إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      {isNewTicketOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-4 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">إنشاء تذكرة دعم جديدة 💬</h3>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block mb-1">عنوان التذكرة:</label>
                <input placeholder="مثال: استفسار عن مواعيد الشحن" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <div>
                <label className="block mb-1">تفاصيل الرسالة:</label>
                <textarea rows={3} placeholder="اكتب تفاصيل استفسارك..." className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <Button 
                onClick={() => {
                  setIsNewTicketOpen(false);
                  showToast('تم فتح تذكرة الدعم بنجاح! سيتم الرد عليك قريباً.');
                }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2.5 rounded-xl cursor-pointer"
              >
                إرسال التذكرة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// تصدير صريح ونظيف في النهاية لتفادي أخطاء الـ Build
export default DashboardPage;