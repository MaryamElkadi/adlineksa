'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function ProductsQrCode() {
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const productsUrl = `${baseUrl}/products`;

    QRCode.toDataURL(productsUrl, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(setQrCode)
      .catch(() => setQrCode(null));
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <h4 className="text-sm font-black text-brand-blue">تصفح منتجاتنا</h4>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        امسح الرمز للوصول إلى جميع المنتجات
      </p>

      {qrCode ? (
        <>
          <img
            src={qrCode}
            alt="رمز QR لصفحة منتجات خط الإعلان السعودية"
            width={120}
            height={120}
            className="mx-auto mt-3 rounded-lg bg-white p-1"
          />
          <a
            href={qrCode}
            download="adline-ksa-products-qr.png"
            className="mt-2 inline-block text-[11px] font-bold text-amber-600 hover:text-amber-700"
          >
            تحميل رمز QR
          </a>
        </>
      ) : (
        <a href="/products" className="mt-3 inline-block text-xs font-bold text-amber-600 hover:text-amber-700">
          تصفح المنتجات
        </a>
      )}
    </section>
  );
}
