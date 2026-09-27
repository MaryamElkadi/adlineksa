export default function Loading() {
  return (
    <div aria-busy="true" className="space-y-10 py-8">
      <section className="mx-auto grid min-h-[32rem] max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8" aria-hidden="true">
        <div className="order-2 aspect-[16/10] animate-pulse rounded-3xl bg-slate-200 lg:order-1" />
        <div className="order-1 space-y-5 lg:order-2">
          <div className="h-8 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="h-14 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-14 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-44 animate-pulse rounded-xl bg-amber-200" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
        <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-square animate-pulse rounded-2xl bg-slate-200" />)}
        </div>
      </section>
    </div>
  );
}
