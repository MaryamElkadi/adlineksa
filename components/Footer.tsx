import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-brand-yellow py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
        <div>
          <h3 className="font-semibold mb-2">خط الإعلان السعودية</h3>
          <p className="text-sm">خدمات الطباعة الرائدة في جميع أنحاء المملكة العربية السعودية.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">روابط سريعة</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/" className="hover:underline">الرئيسية</a></li>
            <li><a href="/products" className="hover:underline">المنتجات</a></li>
            <li><a href="/about" className="hover:underline">عن الشركة</a></li>
            <li><a href="/contact" className="hover:underline">تواصل معنا</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">معلومات التواصل</h3>
          <p className="text-sm">الهاتف: 5678 1234 966+</p>
          <p className="text-sm">البريد الإلكتروني: info@adlineksa.com</p>
        </div>
      </div>
      <div className="mt-6 text-center text-xs opacity-70">
        © {new Date().getFullYear()} خط الإعلان السعودية. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
};

export default Footer;