import React from 'react';

export default function AboutPage() {
  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-right">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
          عن خط الإعلان السعودية
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-blue">
          نُعيد تعريف تميز الطباعة في المملكة العربية السعودية
        </h1>
        <p className="mt-4 text-sm text-slate-600 font-medium leading-relaxed">
          تأسست شركة خط الإعلان في الرياض، وتطورت لتصبح إحدى الشركات الرائدة في مجال الطباعة الرقمية وتكنولوجيا الإعلانات على مستوى المملكة.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-md transition-shadow">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-bold text-brand-blue mb-2">مهمتنا</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            تمكين الشركات، المشاريع الناشئة، ووكالات التسويق من خلال منصة إلكترونية فورية لتخصيص الطباعة، مع دقة متناهية في ألوان CMYK وشحن سريع لجميع المناطق.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-md transition-shadow">
          <div className="text-3xl mb-4">⚙️</div>
          <h3 className="text-lg font-bold text-brand-blue mb-2">أحدث تقنيات الطباعة</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            نمتلك أحدث مطابع هيدلبرغ الأوفست، طابعات إتش بي إنديجو الرقمية، وتقنيات SwissQprint المسطحة بالأشعة فوق البنفسجية للإنتاج الضخم عالي الجودة.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-md transition-shadow">
          <div className="text-3xl mb-4">🇸🇦</div>
          <h3 className="text-lg font-bold text-brand-blue mb-2">رؤية السعودية 2030</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            نفخر بدعم التحول الصناعي في المملكة العربية السعودية من خلال التصنيع المحلي، استخدام أوراق صديقة للبيئة، وتوطين الكفاءات السعودية.
          </p>
        </div>
      </div>
    </div>
  );
}