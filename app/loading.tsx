import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center animate-spin mb-4">
        <div className="w-6 h-6 rounded-lg bg-amber-400" />
      </div>
      <p className="text-sm font-bold text-amber-400">Loading Adline Platform...</p>
    </div>
  );
}
