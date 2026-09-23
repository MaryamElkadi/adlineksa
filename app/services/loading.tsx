import { CatalogCardSkeleton } from "@/components/cards/CatalogCardSkeleton";

export default function ServicesLoading() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 h-24 animate-pulse border-b border-slate-200 bg-slate-100" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <CatalogCardSkeleton key={index} />)}
        </div>
      </div>
    </div>
  );
}
