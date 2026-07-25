'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { calculateConfiguredPrice, formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface SmartConfiguratorProps {
  product: Product;
}

export const SmartConfigurator: React.FC<SmartConfiguratorProps> = ({ product }) => {
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0] || 'Standard');
  const [selectedMaterial, setSelectedMaterial] = useState(product.materials[0] || 'Default');
  const [quantity, setQuantity] = useState(product.minQuantity || 100);
  const [lamination, setLamination] = useState<'none' | 'gloss' | 'velvet' | 'foil'>('none');
  const [customNotes, setCustomNotes] = useState('');
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  // Multipliers
  const sizeMult = selectedSize.includes('Square') ? 0.9 : selectedSize.includes('Large') ? 1.4 : 1.0;
  const matMult = selectedMaterial.includes('Cotton') ? 1.5 : selectedMaterial.includes('Velvet') ? 1.25 : 1.0;
  const lamAddon = lamination === 'foil' ? 0.5 : lamination === 'velvet' ? 0.2 : lamination === 'gloss' ? 0.1 : 0;

  const totalCalculatedPrice = calculateConfiguredPrice(
    product.basePrice / (product.minQuantity || 100),
    quantity,
    sizeMult,
    matMult,
    lamAddon
  );

  const unitCalculatedPrice = Math.round((totalCalculatedPrice / quantity) * 100) / 100;

  const handleAddToCart = () => {
    addItem({
      id: 'item-' + Date.now(),
      productId: product.id,
      productName: product.name,
      image: product.image,
      size: selectedSize,
      material: selectedMaterial,
      quantity,
      unitPrice: unitCalculatedPrice,
      totalPrice: totalCalculatedPrice,
      customNotes,
      fileUrl: fileUploaded || undefined,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-brand-blue">Smart Product Configurator</h2>
          <p className="text-xs text-amber-600 font-bold">Instant dynamic pricing system</p>
        </div>
        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-3 py-1 rounded-full font-bold">
          Live Calculator
        </span>
      </div>

      {/* Step 1: Material */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          1. Select Material & Paperstock
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {product.materials.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`p-3 rounded-xl border text-xs text-left font-bold transition-all ${
                selectedMaterial === mat
                  ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Size */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          2. Select Size & Dimensions
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {product.availableSizes.map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`p-3 rounded-xl border text-xs text-left font-bold transition-all ${
                selectedSize === sz
                  ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Quantity */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Quantity
          </label>
          <span className="text-xs text-amber-600 font-bold">
            {quantity >= 1000 ? '25% Volume Discount Applied!' : quantity >= 500 ? '15% Volume Discount' : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {[100, 250, 500, 1000, 2500].map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                quantity === q
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {q}
            </button>
          ))}
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-blue text-center font-bold"
          />
        </div>
      </div>

      {/* Step 4: Lamination / Finishing */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          4. Special Lamination / Finish
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'none', label: 'Standard Matte' },
            { id: 'gloss', label: 'High Gloss UV' },
            { id: 'velvet', label: 'Soft Touch Velvet' },
            { id: 'foil', label: 'Metallic Gold Foil' },
          ].map((finish) => (
            <button
              key={finish.id}
              onClick={() => setLamination(finish.id as any)}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                lamination === finish.id
                  ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              {finish.label}
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-4 text-center">
        <label className="cursor-pointer block">
          <span className="text-xs text-slate-800 font-bold block mb-1">
            📁 Upload Artwork File (PDF, AI, PSD, PNG)
          </span>
          <span className="text-[11px] text-slate-500 block mb-2">
            Max 50MB. CMYK 300DPI recommended.
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFileUploaded(e.target.files[0].name);
              }
            }}
          />
          <span className="inline-block px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-brand-blue font-bold shadow-xs hover:bg-slate-100">
            {fileUploaded ? `File Attached: ${fileUploaded}` : 'Choose File'}
          </span>
        </label>
      </div>

      {/* Dynamic Summary Footer */}
      <div className="bg-brand-blue rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg">
        <div>
          <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">Estimated Price</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">
              {formatCurrency(totalCalculatedPrice)}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              ({formatCurrency(unitCalculatedPrice)} / unit)
            </span>
          </div>
          <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">
            ✓ Estimated Delivery: 2-3 Business Days KSA
          </span>
        </div>

        <Button
          size="lg"
          variant="yellow"
          onClick={handleAddToCart}
          className="w-full sm:w-auto text-slate-950 font-black"
        >
          {isAdded ? '✓ Added to Cart!' : 'Add Configured Item to Cart'}
        </Button>
      </div>
    </div>
  );
};
