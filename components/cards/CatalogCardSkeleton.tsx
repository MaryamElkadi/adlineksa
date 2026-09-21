export function CatalogCardSkeleton() {
  return <div aria-hidden="true" className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
    <div className="aspect-[16/10] bg-slate-200" />
    <div className="space-y-3 p-5"><div className="h-3 w-20 rounded bg-slate-200" /><div className="h-5 w-2/3 rounded bg-slate-200" /><div className="h-3 w-full rounded bg-slate-100" /><div className="h-3 w-4/5 rounded bg-slate-100" /><div className="mt-5 h-9 rounded bg-slate-100" /></div>
  </div>;
}
