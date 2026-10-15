export default function Loading() {
  return (
    <div aria-busy="true" className="space-y-12 py-10" dir="rtl">
      {/* HERO SKELETON */}
      <section className="mx-auto grid min-h-[30rem] max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8" aria-hidden="true">
        {/* Left Column Preview Card */}
        <div className="order-2 aspect-[16/10] animate-pulse rounded-3xl border border-slate-200 bg-slate-100 p-6 lg:order-1 lg:col-span-5" />

        {/* Right Column Typography */}
        <div className="order-1 space-y-6 text-right lg:order-2 lg:col-span-7">
          <div className="h-7 w-64 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
            <div className="h-12 w-3/4 animate-pulse rounded-xl bg-slate-200" />
          </div>
          <div className="h-20 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="flex gap-4">
            <div className="h-12 w-40 animate-pulse rounded-xl bg-amber-200" />
            <div className="h-12 w-40 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </section>

      {/* CATEGORIES SKELETON */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
        <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </section>
    </div>
  );
}
