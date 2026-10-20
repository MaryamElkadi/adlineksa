'use client';

import React, { useState } from 'react';
import { PricingOption, Product, QuantityTier } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface SmartConfiguratorProps {
  product: Product;
}

function getInitialQuantity(product: Product, pricingType: NonNullable<Product['pricingType']>) {
  const tiers = (product.configurableQuantityTiers || [])
    .filter((tier) => Number.isFinite(tier.quantity) && tier.quantity > 0)
    .sort((a, b) => a.quantity - b.quantity);

  if (pricingType === 'tiered' && tiers.length > 0) {
    return tiers[0].quantity;
  }

  if (!product.pricingType && product.quantityTiers && product.quantityTiers.length > 0) {
    const sorted = [...product.quantityTiers].filter((q) => q > 0).sort((a, b) => a - b);
    return sorted[0] || Math.max(1, Number(product.minQuantity) || 1);
  }

  const initial = Math.max(pricingType === 'meter' ? 0.01 : 1, Number(product.minQuantity) || 1);
  return Math.min(initial, Number(product.stock) || initial);
}

export const SmartConfigurator: React.FC<SmartConfiguratorProps> = ({ product }) => {
  const { addItem } = useCart();
  const legacyPricingType = product.pricingType || (
    product.configurableQuantityTiers?.length || product.quantityTiers?.length ? 'tiered' : 'quantity'
  );
  const pricingOptions: PricingOption[] = product.pricingOptions?.filter((option) => option.enabled !== false) || [];
  const [selectedPricingOptionId, setSelectedPricingOptionId] = useState(pricingOptions[0]?.id || 'legacy');
  const activePricingOption = pricingOptions.find((option) => option.id === selectedPricingOptionId);
  const pricingUnit = activePricingOption?.unit || (legacyPricingType === 'meter' ? 'meter' : 'piece');
  // A pricing option always accepts a free quantity. Its tiers are exact-quantity
  // price overrides (100, 200, 300…) rather than a restriction on ordering.
  const pricingType = activePricingOption ? (pricingUnit === 'meter' ? 'meter' : 'quantity') : legacyPricingType;
  const maxAvailable = Math.min(Number(product.stock) || 0, Number(product.maxQuantity) || Infinity);

  const materialOptions = product.configurableMaterials?.length
    ? product.configurableMaterials.map((option) => option.label)
    : product.materials;
  const sizeOptions = product.configurableSizes?.length
    ? product.configurableSizes.map((option) => option.label)
    : product.availableSizes;

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] || 'قياسي');
  const [selectedMaterial, setSelectedMaterial] = useState(materialOptions[0] || 'افتراضي');
  const [quantity, setQuantity] = useState(() => activePricingOption?.minQuantity || getInitialQuantity(product, legacyPricingType));
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.label || '');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const [designPlacement, setDesignPlacement] = useState(product.configurableDesignPlacements?.[0]?.label || '');
  const [printSide, setPrintSide] = useState(product.configurablePrintSides?.[0]?.label || '');
  const [lighting, setLighting] = useState(product.configurableLighting?.[0]?.label || '');
  const [installation, setInstallation] = useState(false);
  const [cartError, setCartError] = useState('');
  const finishOptions = (product.configurableFinishes || [])
    .filter((finish) => finish.label && finish.label.trim() !== '')
    .map((finish) => ({
      id: finish.label,
      label: finish.label,
      priceModifier: Number(finish.priceModifier) || 0,
    }));

  const [lamination, setLamination] = useState(
    product.configurableFinishes?.[0]?.label || ''
  );
  const [customNotes, setCustomNotes] = useState('');
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [needDesign, setNeedDesign] = useState(false);
  const [designBrief, setDesignBrief] = useState('');

  const hasConfigurableTiers = !activePricingOption && pricingType === 'tiered' && Boolean(product.configurableQuantityTiers?.length || product.quantityTiers?.length);
  const selectedBasePrice = activePricingOption?.basePrice ?? product.basePrice ?? 0;
  const activeTiers: QuantityTier[] = activePricingOption
    ? activePricingOption.tiers
    : product.configurableQuantityTiers?.length
      ? product.configurableQuantityTiers
      : pricingType === 'tiered'
        ? (product.quantityTiers || []).map((tierQuantity) => ({
          quantity: tierQuantity,
          unitPrice: selectedBasePrice,
        }))
        : [];
  const matchingTier = activeTiers.find((t) => t.quantity === quantity);
  const tierDiscount = Math.min(100, Math.max(0, matchingTier?.discountPercent || 0));
  const tierValue = (matchingTier?.unitPrice ?? selectedBasePrice) * (1 - tierDiscount / 100);
  const isFixedTierPrice = Boolean(matchingTier) || pricingType === 'tiered';
  const basePriceForQuantity = activePricingOption
    ? matchingTier
      ? tierValue
      : selectedBasePrice * quantity
    : pricingType === 'tiered' && matchingTier
      ? tierValue
      : selectedBasePrice * quantity;
  const selectedPricingLabel = activePricingOption?.label || (
    pricingType === 'tiered' ? 'شرائح الكميات' : pricingUnit === 'meter' ? 'بالمتر' : 'بالقطعة'
  );
  const tierPriceLabel = isFixedTierPrice
    ? 'إجمالي الشريحة'
    : pricingUnit === 'meter' ? 'سعر المتر' : 'سعر القطعة';

  const matOption = product.configurableMaterials?.find((m) => m.label === selectedMaterial);
  const sizeOption = product.configurableSizes?.find((s) => s.label === selectedSize);
  const finishOption = finishOptions.find((f) => f.label === lamination);
  const designPlacementOption = product.configurableDesignPlacements?.find((option) => option.label === designPlacement);
  const printSideOption = product.configurablePrintSides?.find((option) => option.label === printSide);
  const lightingOption = product.configurableLighting?.find((option) => option.label === lighting);

  const matAddon = matOption ? matOption.priceModifier : 0;
  const sizeAddon = sizeOption ? sizeOption.priceModifier : 0;
  const finishAddon = finishOption ? finishOption.priceModifier : 0;
  const DESIGN_FEE = needDesign ? product.designFee ?? 75 : 0;

  const placementAddon = designPlacementOption?.priceModifier || 0;
  const printSideAddon = printSideOption?.priceModifier || 0;
  const lightingAddon = lightingOption?.priceModifier || 0;
  const installationAddon = installation ? product.installationFee || 0 : 0;
  const addOnPrice = matAddon + sizeAddon + finishAddon + DESIGN_FEE + placementAddon + printSideAddon + lightingAddon + installationAddon;
  const totalCalculatedPrice = Math.max(0, basePriceForQuantity + addOnPrice);
  const unitCalculatedPrice = Math.round((totalCalculatedPrice / Math.max(1, quantity)) * 100) / 100;
  const selectedPredefinedColor = product.colors?.find((color) => color.label === selectedColor);
  const chosenColorHex = product.colorSelectionMode === 'custom' ? customColorHex : selectedPredefinedColor?.hex;
  const quantityOptions = hasConfigurableTiers
    ? activeTiers.length
      ? activeTiers
        .filter((tier) => Number.isFinite(tier.quantity) && tier.quantity > 0)
        .filter((tier) => tier.quantity <= maxAvailable)
        .sort((a, b) => a.quantity - b.quantity)
        .map((tier) => tier.quantity)
      : [...new Set(product.quantityTiers || [])]
        .filter((q) => Number.isFinite(q) && q > 0 && q <= maxAvailable)
        .sort((a, b) => a - b)
    : [];


  const handleAddToCart = () => {
    setCartError('');
    const added = addItem({
      id: 'item-' + Date.now(),
      productId: product.id,
      productName: product.name,
      image: product.image,
      size: selectedSize,
      material: selectedMaterial,
      color: product.colorSelectionMode === 'custom' ? customColorHex : selectedColor,
      colorHex: chosenColorHex,
      designPlacement,
      finish: lamination,
      printSide,
      lighting,
      installation,
      needDesign,
      designBrief: needDesign ? designBrief : '',
      pricingType,
      pricingOptionId: activePricingOption?.id || undefined,
      pricingOptionLabel: activePricingOption?.label || undefined,
      pricingUnit,
      pricingBasePrice: selectedBasePrice,
      pricingTiers: activePricingOption?.tiers.length
        ? activePricingOption.tiers
        : pricingType === 'tiered'
          ? product.configurableQuantityTiers?.length
            ? product.configurableQuantityTiers
            : (product.quantityTiers || []).map((tierQuantity) => ({
              quantity: tierQuantity,
              unitPrice: selectedBasePrice,
            }))
          : [],
      tierPriceMode: 'fixed',
      pricingAddOnTotal: addOnPrice,
      quantity,
      maxStock: maxAvailable,
      unitPrice: unitCalculatedPrice,
      totalPrice: totalCalculatedPrice,
      customNotes,
      fileUrl: fileUploaded || undefined,
    });

    if (!added) {
      setCartError('الكمية المطلوبة تتجاوز المخزون المتاح. قللي الكمية أو راجعي السلة.');
      return;
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const updateEnteredQuantity = (value: string) => {
    const nextQuantity = Number(value);
    const minimum = activePricingOption?.minQuantity || (pricingUnit === 'meter' ? 0.01 : Math.max(1, Number(product.minQuantity) || 1));
    if (Number.isFinite(nextQuantity) && nextQuantity >= minimum) {
      setQuantity(Math.min(nextQuantity, maxAvailable));
    }
  };

  const handleFileUpload = async (file: File) => {
    setCartError('');
    if (file.size > 50 * 1024 * 1024) {
      setCartError('حجم الملف يجب ألا يتجاوز 50MB.');
      return;
    }
    setIsUploadingFile(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('name', `ملف طلب: ${product.nameAr || product.name}`);
      const response = await fetch('/api/artworks', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok || !result.fileUrl) throw new Error(result.message || 'تعذر رفع الملف.');
      setFileUploaded(result.fileUrl);
      setUploadedFileName(file.name);
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'تعذر رفع الملف.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  return (
    <div dir="rtl" className="bg-white border-2 border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-brand-blue">أداة تخصيص المنتجات الذكية</h2>
          <p className="text-xs text-amber-600 font-bold">نظام تسعير ديناميكي فوري</p>
        </div>
        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-3 py-1 rounded-full font-bold">
          حاسبة فورية
        </span>
      </div>

      {/* الخطوة 1: اختيار المادة */}
      {materialOptions.length > 0 && (
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            1. اختر خامة الورق والمادة
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {materialOptions.map((mat) => {
              const priceModifier = product.configurableMaterials?.find((option) => option.label === mat)?.priceModifier || 0;
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setSelectedMaterial(mat)}
                  className={`p-3 rounded-xl border text-xs text-right font-bold transition-all ${
                    selectedMaterial === mat
                      ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{mat}</span>
                  {priceModifier !== 0 && <span className="mt-1 block text-amber-700">+{formatCurrency(priceModifier)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* الخطوة 2: اختيار المقاس */}
      {sizeOptions.length > 0 && (
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            2. اختر المقاس والأبعاد
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sizeOptions.map((sz) => {
              const priceModifier = product.configurableSizes?.find((option) => option.label === sz)?.priceModifier || 0;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`p-3 rounded-xl border text-xs text-right font-bold transition-all ${
                    selectedSize === sz
                      ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{sz}</span>
                  {priceModifier !== 0 && <span className="mt-1 block text-amber-700">+{formatCurrency(priceModifier)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {product.colorSelectionMode === 'custom' ? (
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">اختاري أي لون من لوحة الألوان</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label="اختيار أي لون"
              value={customColorHex}
              onChange={(event) => setCustomColorHex(event.target.value)}
              className="h-12 w-16 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
            />
            <span className="text-xs font-bold uppercase text-slate-600">{customColorHex}</span>
          </div>
        </div>
      ) : product.colors && product.colors.length > 0 ? (
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">اختر اللون</label>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={`${color.label}-${color.hex}`}
                type="button"
                onClick={() => setSelectedColor(color.label)}
                aria-label={`اختيار اللون ${color.label}`}
                aria-pressed={selectedColor === color.label}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  selectedColor === color.label
                    ? 'border-brand-blue bg-blue-50 text-brand-blue ring-2 ring-blue-100'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="h-5 w-5 rounded-full border border-black/15" style={{ backgroundColor: color.hex }} />
                {color.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* الخطوة 3: الكمية */}
      {pricingOptions.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700">3. اختاري طريقة التسعير</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {pricingOptions.map((option) => <button key={option.id} type="button" onClick={() => { setSelectedPricingOptionId(option.id); setQuantity(option.minQuantity || (option.unit === 'meter' ? 0.01 : 1)); }} className={`rounded-xl border p-3 text-right text-xs font-bold ${activePricingOption?.id === option.id ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-200 bg-slate-50 text-slate-700'}`}><span className="block">{option.label}</span><span className="mt-1 block text-[10px] opacity-75">{option.unit === 'meter' ? 'بالمتر' : 'بالقطعة'}{option.tiers.length ? ' • شرائح كميات' : ''}</span></button>)}
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">يمكن إدخال أي كمية. تُطبّق شريحة خاصة تلقائياً فقط عند مطابقة كمية الشريحة بالضبط.</p>
        </div>
      )}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {pricingOptions.length ? '4.' : '3.'} {pricingUnit === 'meter' ? 'الطول بالمتر' : 'الكمية'}
          </label>
          {matchingTier && (
            <span className="text-xs text-amber-600 font-bold">
              {tierPriceLabel}: {formatCurrency(tierValue)}
            </span>
          )}
        </div>
        <p className={`mb-3 text-xs font-bold ${maxAvailable > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          {maxAvailable > 0
            ? `المتاح في المخزون: ${maxAvailable} ${pricingUnit === 'meter' ? 'متر' : 'قطعة'}`
            : 'نفدت الكمية حالياً'}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {(activePricingOption?.tiers?.length ? activePricingOption.tiers : pricingType === 'tiered' ? activeTiers : []).map((tier) => {
            const q = tier.quantity;
            return (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                  quantity === q
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="block text-sm">{q} {pricingUnit === 'meter' ? 'متر' : 'قطعة'}</span>
                <span className="mt-0.5 block font-bold text-slate-800">
                  {tier.discountPercent ? (
                    <><span className="ml-1 text-[10px] text-slate-400 line-through">{formatCurrency(tier.unitPrice)}</span>{formatCurrency(tier.unitPrice * (1 - Math.min(100, Math.max(0, tier.discountPercent)) / 100))}<span className="mr-1 text-[10px] text-emerald-700">خصم {tier.discountPercent}%</span></>
                  ) : formatCurrency(tier.unitPrice)}
                  <span className="mr-1 text-[10px] font-semibold text-slate-500">
                    إجمالي الشريحة
                  </span>
                </span>
              </button>
            );
          })}
          {(activePricingOption || pricingType !== 'tiered') && (
            <input
              type="number"
              min={pricingUnit === 'meter' ? '0.01' : Math.max(1, Number(product.minQuantity) || 1)}
              max={maxAvailable}
              step={pricingUnit === 'meter' ? '0.01' : '1'}
              value={quantity}
              onChange={(e) => updateEnteredQuantity(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-blue text-center font-bold"
            />
          )}
          {pricingType === 'tiered' && !activePricingOption && !quantityOptions.length && maxAvailable > 0 && (
            <p className="text-xs font-semibold text-rose-600">لا توجد شريحة كمية متاحة ضمن المخزون الحالي.</p>
          )}
        </div>
      </div>

      {product.configurableDesignPlacements && product.configurableDesignPlacements.length > 0 && (
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">مكان التصميم</label>
          <div className="flex flex-wrap gap-2">
            {product.configurableDesignPlacements.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setDesignPlacement(option.label)}
                aria-pressed={designPlacement === option.label}
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                  designPlacement === option.label ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-200 text-slate-600'
                }`}
              >
                {option.label}
                {option.priceModifier > 0 && <span className="mr-1 text-amber-700">+{formatCurrency(option.priceModifier)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.configurablePrintSides && product.configurablePrintSides.length > 0 && (
        <div>
          <label htmlFor="print-side" className="text-xs font-bold text-slate-700 block mb-2">وجه الطباعة</label>
          <select
            id="print-side"
            value={printSide}
            onChange={(event) => setPrintSide(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
          >
            {product.configurablePrintSides.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}{option.priceModifier > 0 ? ` (+${formatCurrency(option.priceModifier)})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {product.installationAvailable && (
        <fieldset className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
          <legend className="px-1 text-xs font-bold text-slate-800">خدمة التركيب</legend>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-700">
            <label className="flex items-center gap-2">
              <input type="radio" name={`installation-${product.id}`} checked={installation} onChange={() => setInstallation(true)} className="accent-cyan-600" />
              مع تركيب {product.installationFee !== undefined ? `(يبدأ من ${formatCurrency(product.installationFee)})` : ''}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name={`installation-${product.id}`} checked={!installation} onChange={() => setInstallation(false)} className="accent-cyan-600" />
              بدون تركيب
            </label>
          </div>
        </fieldset>
      )}

      {product.configurableLighting && product.configurableLighting.length > 0 && (
        <div>
          <label htmlFor="product-lighting" className="text-xs font-bold text-slate-700 block mb-2">اختيار الإضاءة</label>
          <select
            id="product-lighting"
            value={lighting}
            onChange={(event) => setLighting(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
          >
            {product.configurableLighting.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}{option.priceModifier > 0 ? ` (+${formatCurrency(option.priceModifier)})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* الخطوة 4: التغليف / اللمسات الأخيرة */}
      {finishOptions.length > 0 && (
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            4. السلفنة واللمسات الخاصة
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {finishOptions.map((finish) => (
              <button
                key={finish.id}
                type="button"
                onClick={() => setLamination(finish.id)}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  lamination === finish.id
                    ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>{finish.label}</span>
                {finish.priceModifier !== 0 && <span className="mt-1 block text-amber-700">+{formatCurrency(finish.priceModifier)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* قسم رفع الملفات */}
      {!needDesign ? (
  <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-4 text-center">
    <label className="cursor-pointer block">

      <span className="text-xs font-bold block mb-2">
        📁 رفع ملف التصميم
      </span>

      <span className="text-[11px] text-slate-500 block mb-3">
        PDF, AI, PSD, PNG (حتى 50MB)
      </span>

      <input
        type="file"
        className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleFileUpload(file); }}
        disabled={isUploadingFile}
      />

      <span className="inline-block px-4 py-2 rounded-lg bg-white border border-slate-300 font-bold text-brand-blue">
        {isUploadingFile ? 'جاري رفع الملف...' : fileUploaded ? `الملف: ${uploadedFileName}` : 'اختر الملف'}
      </span>

    </label>
  </div>
) : (
  <div className="rounded-2xl border border-amber-300 bg-white p-5">

    <h3 className="font-black text-brand-blue mb-3">
      أخبرنا عن التصميم الذي تريده
    </h3>

    <textarea
      rows={5}
      value={designBrief}
      onChange={(e) => setDesignBrief(e.target.value)}
      placeholder="مثال:
- أريد تصميم بروشور لشركة عقارات
- الألوان: الأزرق والذهبي
- أضف شعار الشركة
- تصميم احترافي وحديث..."
      className="w-full rounded-xl border border-slate-300 p-3 text-sm resize-none focus:outline-none focus:border-brand-blue"
    />

    <p className="text-xs text-slate-500 mt-2">
      سيقوم فريق التصميم بالتواصل معك لإعداد التصميم قبل بدء الطباعة.
    </p>

  </div>
)}


      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={needDesign}
      onChange={(e) => {
        setNeedDesign(e.target.checked);

        if (e.target.checked) {
          setFileUploaded(null);
        }
      }}
      className="mt-1 h-5 w-5 accent-amber-500"
    />

    <div>
      <p className="font-bold text-slate-900">
        لا أملك تصميمًا
      </p>

      <p className="text-xs text-slate-600 mt-1">
        أريد من شركة Adline KSA تصميم المنتج لي قبل الطباعة.
      </p>
    </div>
  </label>
</div>

      {/* ملخص السعر */}
    {/* ملخص السعر */}
<div className="bg-brand-blue rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg">

  <div className="w-full">

    {/* Design fee */}
    {needDesign && (
      <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-3 text-sm">
        <span>🎨 خدمة التصميم</span>
        <span className="font-bold">
          {formatCurrency(product.designFee ?? 75)}
        </span>
      </div>
    )}

    <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
      {`السعر التقديري ${pricingUnit === 'meter' ? 'للمتر' : 'للقطعة'}${pricingType === 'tiered' || activePricingOption?.tiers.length ? ` حسب ${selectedPricingLabel}` : ''}`}
    </span>

    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-amber-400">
        {formatCurrency(unitCalculatedPrice)}
      </span>
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 text-slate-900">
      <span className="text-sm font-bold">
        الإجمالي للكمية {quantity} {pricingUnit === 'meter' ? 'متر' : 'قطعة'}
      </span>
      <span className="text-xl font-black">
        {formatCurrency(totalCalculatedPrice)}
      </span>
    </div>

    <span className="text-[10px] text-emerald-300 font-bold block mt-1">
      ✓ التوصيل المتوقع: 2-3 أيام عمل داخل المملكة العربية السعودية
    </span>

  </div>
  {cartError && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-700">{cartError}</p>}

  <Button
    size="lg"
    variant="yellow"
    onClick={handleAddToCart}
    disabled={maxAvailable <= 0 || (pricingType === 'tiered' && !quantityOptions.includes(quantity))}
    className="w-full sm:w-auto text-slate-950 font-black"
  >
    {isAdded ? '✓ تم الإضافة إلى السلة!' : 'إضافة المنتج المخصص إلى السلة'}
  </Button>

</div>
    </div>
  );
};
