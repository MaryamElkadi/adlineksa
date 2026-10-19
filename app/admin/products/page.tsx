'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category, Product, ConfigOption, QuantityTier, ProductColor, ImageMedia, VideoMedia } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, getProductStartingPriceDetails } from '@/lib/utils';
import Swal from 'sweetalert2';
import { MediaManager } from '@/components/media/MediaManager';

const defaultImage = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80';

interface ProductFormState extends Partial<Product> {
  materialsList: ConfigOption[];
  sizesList: ConfigOption[];
  finishesList: ConfigOption[];
  quantitiesList: QuantityTier[];
  colorsList: ProductColor[];
  designPlacementsList: ConfigOption[];
  printSidesList: ConfigOption[];
  lightingList: ConfigOption[];
  colorSelectionMode: 'custom' | 'predefined';
  images: ImageMedia[];
  videos: VideoMedia[];
  coverImage: string;
}

const initialFormState: ProductFormState = {
  name: '',
  nameAr: '',
  slug: '',
  categorySlug: '',
  basePrice: 100,
  designFee: 75,
  salePrice: undefined,
  discount: 0,
  minQuantity: 1,
  maxQuantity: undefined,
  stock: 0,
  pricingType: 'quantity',
  description: '',
  shortDescription: '',
  brand: '',
  sku: '',
  image: '',
  gallery: [],
  images: [],
  videos: [],
  coverImage: '',
  badge: '',
  featured: false,
  bestseller: false,
  newArrival: false,
  active: true,
  rating: 0,
  reviewCount: 0,
  availableSizes: [],
  materials: [],
  configurableMaterials: [],
  configurableSizes: [],
  configurableFinishes: [],
  configurableQuantityTiers: [],
  materialsList: [
    { label: 'Anti-curl PET Film', priceModifier: 0 },
    { label: 'Flex Banner 440gsm', priceModifier: 15 },
  ],
  sizesList: [
    { label: '85x200 cm', priceModifier: 0 },
    { label: '100x200 cm', priceModifier: 20 },
  ],
  finishesList: [
    { label: 'Standard Matte', priceModifier: 0 },
    { label: 'High Gloss UV', priceModifier: 10 },
  ],
  quantitiesList: [],
  colorsList: [],
  colorSelectionMode: 'predefined',
  designPlacementsList: [],
  printSidesList: [],
  lightingList: [],
  installationAvailable: false,
  installationFee: 0,
  seoTitle: '',
  seoDescription: '',
};

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const marketplace = searchParams?.get('marketplace');
  const [productList, setProductList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [skuError, setSkuError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>(initialFormState);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = async () => {
    try {
      const [products, categoryList] = await Promise.all([
        api.getProducts({ compact: true }),
        api.getCategories(),
      ]);
      setProductList(products);
      setCategories(categoryList);
      if (categoryList.length > 0 && !formData.categorySlug) {
        setFormData((prev) => ({ ...prev, categorySlug: categoryList[0].slug }));
      }
    } catch {
      setError('Could not load the product catalog.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      categorySlug: categories[0]?.slug || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (product: Product) => {
    setError('');
    try {
      const fullProduct = await api.getProduct(product.id);
      setEditingId(fullProduct.id);
      setFormData({
        ...fullProduct,
        images: fullProduct.images?.length
          ? fullProduct.images
          : [...new Set([fullProduct.coverImage || fullProduct.image, ...(fullProduct.gallery || [])].filter(Boolean))]
              .map((url, sortOrder) => ({ url, sortOrder, alt: '' })),
        videos: fullProduct.videos || [],
        coverImage: fullProduct.coverImage || fullProduct.image || fullProduct.gallery?.[0] || '',
        materialsList: fullProduct.configurableMaterials?.length
          ? fullProduct.configurableMaterials
          : (fullProduct.materials || []).map((m) => ({ label: m, priceModifier: 0 })),
        sizesList: fullProduct.configurableSizes?.length
          ? fullProduct.configurableSizes
          : (fullProduct.availableSizes || []).map((s) => ({ label: s, priceModifier: 0 })),
        finishesList: fullProduct.configurableFinishes || [],
        quantitiesList: fullProduct.configurableQuantityTiers?.length
          ? fullProduct.configurableQuantityTiers
          : (fullProduct.quantityTiers || []).map((q) => ({ quantity: q, unitPrice: fullProduct.basePrice || 0 })),
        colorsList: fullProduct.colors || [],
        colorSelectionMode: fullProduct.colorSelectionMode || 'predefined',
        designPlacementsList: fullProduct.configurableDesignPlacements || [],
        printSidesList: fullProduct.configurablePrintSides || [],
        lightingList: fullProduct.configurableLighting || [],
        installationAvailable: fullProduct.installationAvailable || false,
        installationFee: fullProduct.installationFee || 0,
        pricingType: fullProduct.pricingType || (fullProduct.configurableQuantityTiers?.length || fullProduct.quantityTiers?.length ? 'tiered' : 'quantity'),
      });
      setIsModalOpen(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not load product.');
    }
  };

  // Option Handlers
  const handleAddOption = (key: 'materialsList' | 'sizesList' | 'finishesList' | 'designPlacementsList' | 'printSidesList' | 'lightingList') => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { label: '', priceModifier: 0 }],
    }));
  };

  const handleRemoveOption = (key: 'materialsList' | 'sizesList' | 'finishesList' | 'designPlacementsList' | 'printSidesList' | 'lightingList', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (
    key: 'materialsList' | 'sizesList' | 'finishesList' | 'designPlacementsList' | 'printSidesList' | 'lightingList',
    index: number,
    field: 'label' | 'priceModifier',
    value: string | number
  ) => {
    setFormData((prev) => {
      const updated = [...(prev[key] || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [key]: updated };
    });
  };

  // Quantity Tier Handlers
  const handleAddQuantity = () => {
    setFormData((prev) => ({
      ...prev,
      quantitiesList: [...(prev.quantitiesList || []), { quantity: 100, unitPrice: prev.basePrice || 0 }],
    }));
  };

  const handleRemoveQuantity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quantitiesList: (prev.quantitiesList || []).filter((_, i) => i !== index),
    }));
  };

  const handleQuantityChange = (index: number, field: 'quantity' | 'unitPrice' | 'discountPercent', value: number) => {
    setFormData((prev) => {
      const updated = [...(prev.quantitiesList || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, quantitiesList: updated };
    });
  };

  const handleColorChange = (index: number, field: 'label' | 'hex', value: string) => {
    setFormData((prev) => {
      const updated = [...(prev.colorsList || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, colorsList: updated };
    });
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting) return; // Prevent double-click
    setError('');
    setSkuError('');
    setIsSubmitting(true);

    const autoSlug =
      formData.slug ||
      formData.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      '';

    const cleanMaterials = (formData.materialsList || []).filter((m) => m.label.trim() !== '');
    const cleanSizes = (formData.sizesList || []).filter((s) => s.label.trim() !== '');
    const cleanFinishes = (formData.finishesList || []).filter((f) => f.label.trim() !== '');
    const cleanQuantities = (formData.quantitiesList || [])
      .filter((q) => Number.isInteger(q.quantity) && q.quantity > 0 && Number.isFinite(q.unitPrice) && q.unitPrice >= 0)
      .map((q) => ({ ...q, discountPercent: Math.min(100, Math.max(0, Number(q.discountPercent) || 0)) }))
      .sort((a, b) => a.quantity - b.quantity);
    const cleanColors = (formData.colorsList || [])
      .filter((color) => color.label.trim() && /^#[0-9a-fA-F]{6}$/.test(color.hex));
    const cleanPlacements = (formData.designPlacementsList || []).filter((option) => option.label.trim());
    const cleanPrintSides = (formData.printSidesList || []).filter((option) => option.label.trim());
    const cleanLighting = (formData.lightingList || []).filter((option) => option.label.trim());
    if (formData.pricingType === 'tiered' && cleanQuantities.length === 0) {
      setError('أضيفي شريحة كمية واحدة على الأقل قبل حفظ المنتج.');
      setIsSubmitting(false);
      return;
    }

    // Fallback to default placeholder image if left empty
    const selectedCover = formData.images.find((image) => image.url === formData.coverImage)?.url;
    const finalImage = selectedCover || formData.images[0]?.url || defaultImage;
    const finalImages = formData.images.length
      ? formData.images
      : [{ url: finalImage, alt: '', sortOrder: 0 }];

    // SKU: send trimmed value or empty string (backend will auto-generate)
    const skuValue = formData.sku?.trim() || '';

    const payload = {
      ...formData,
      slug: autoSlug,
      sku: skuValue,
      image: finalImage,
      coverImage: finalImage,
      images: finalImages.map((image, sortOrder) => ({ ...image, sortOrder })),
      videos: formData.videos || [],
      gallery: finalImages.filter((image) => image.url !== finalImage).map((image) => image.url),
      basePrice: Number(formData.basePrice) || 0,
      pricingType: formData.pricingType || 'quantity',
      stock: Math.max(0, Number(formData.stock) || 0),
      designFee: Number(formData.designFee ?? 75),
      salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
      discount: formData.discount ? Number(formData.discount) : 0,
      minQuantity: Number(formData.minQuantity) || 1,

      configurableMaterials: cleanMaterials,
      configurableSizes: cleanSizes,
      configurableFinishes: cleanFinishes,
      configurableQuantityTiers: formData.pricingType === 'tiered' ? cleanQuantities : [],
      colors: formData.colorSelectionMode === 'predefined' ? cleanColors : [],
      configurableDesignPlacements: cleanPlacements,
      configurablePrintSides: cleanPrintSides,
      configurableLighting: cleanLighting,
      installationAvailable: Boolean(formData.installationAvailable),
      installationFee: Math.max(0, Number(formData.installationFee) || 0),

      materials: cleanMaterials.map((m) => m.label),
      availableSizes: cleanSizes.map((s) => s.label),
      quantityTiers: formData.pricingType === 'tiered' ? cleanQuantities.map((q) => q.quantity) : [],
    };

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const resData = await response.json();

        // Handle SKU-specific duplicate error
        if (response.status === 409 && resData.error === 'SKU_ALREADY_EXISTS') {
          setSkuError('رقم SKU مستخدم بالفعل — هذا الرقم التعريفي مرتبط بمنتج آخر. يرجى استخدام SKU مختلف.');
          setIsSubmitting(false);
          return;
        }

        throw new Error(resData.message || 'فشل حفظ المنتج.');
      }

      await Swal.fire({
        icon: 'success',
        title: editingId ? 'تم تعديل المنتج بنجاح! ✨' : 'تم إنشاء المنتج بنجاح! 🎉',
        timer: 2000,
        showConfirmButton: false,
      });

      setIsModalOpen(false);
      void load();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmResult = await Swal.fire({
      title: 'هل أنت تأكد من حذف هذا المنتج؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#e11d48',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        void load();
      } else {
        setError('Could not delete product.');
      }
    } catch {
      setError('Could not delete product.');
    }
  }

  const categoryLabel = (slug: string) =>
    categories.find((category) => category.slug === slug)?.nameAr ||
    categories.find((category) => category.slug === slug)?.name ||
    slug.replace('-', ' ');

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <div>
          <span className="inline-block text-xs font-black text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full mb-2">
          ✨ خيارات المنتجات والأسعار والمخزون
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">إدارة المنتجات والأسعار والمخزون</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            تحديد الألوان وطريقة التسعير والكمية المتاحة لكل منتج.
          </p>
        </div>
        <Button
          variant="yellow"
          onClick={handleOpenAddModal}
          className="text-slate-900 font-black shadow-md hover:shadow-lg transition-all transform active:scale-95 bg-amber-400 hover:bg-amber-300 rounded-2xl px-5 py-3"
        >
          ✨ + إضافة منتج جديد
        </Button>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">{error}</p>}

      {/* Product List Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-medium text-slate-700">
            <thead className="bg-gradient-to-r from-slate-50 to-amber-50/30 text-slate-800 uppercase font-black text-[11px] border-b border-slate-200/80">
              <tr>
                {marketplace && <th className="p-4">اختيار</th>}
                <th className="p-4">المنتج</th>
                <th className="p-4">الفئة</th>
                <th className="p-4">السعر المبدئي</th>
                <th className="p-4">المخزون</th>
                <th className="p-4">طريقة التسعير</th>
                <th className="p-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productList.map((product) => {
                const startingPrice = getProductStartingPriceDetails(
                  product.basePrice,
                  product.pricingType === 'tiered' || (!product.pricingType && product.configurableQuantityTiers?.length)
                    ? product.configurableQuantityTiers
                    : undefined
                );

                return (
                <tr key={product.id} className="hover:bg-amber-50/30 transition-colors">
                  {marketplace && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => {
                          setSelectedIds((prev) =>
                            prev.includes(product.id)
                              ? prev.filter((id) => id !== product.id)
                              : [...prev, product.id]
                          );
                        }}
                        className="h-4 w-4 text-amber-600 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.nameAr || product.name}
                      className="w-11 h-11 rounded-xl object-cover border border-amber-200/50 shadow-2xs"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block text-sm">{product.nameAr || product.name}</span>
                      <span className="text-[10px] text-amber-700/60 font-mono bg-amber-50 px-1.5 py-0.5 rounded-md">
                        /{product.slug}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-bold">
                      {categoryLabel(product.categorySlug)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="block font-black text-amber-600 text-sm">
                      {formatCurrency(startingPrice.unitPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {product.pricingType === 'meter' ? 'للمتر' : startingPrice.quantity > 1 ? `لـ ${startingPrice.quantity} قطعة` : 'للقطعة'}
                    </span>
                  </td>
                  <td className="p-4 font-bold">
                    <span className={(product.stock || 0) > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {product.pricingType === 'meter' ? 'بالمتر' : product.pricingType === 'quantity' ? 'بالقطعة' : `${product.configurableQuantityTiers?.length || product.quantityTiers?.length || 0} شرائح`}
                    </span>
                  </td>
                  <td className="p-4 text-left space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-xl transition-all"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {marketplace && (
        <div className="mt-4 flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="yellow"
            onClick={() => setSelectedIds(productList.map((p) => p.id))}
            className="text-slate-900 font-bold"
          >
            تحديد الكل
          </Button>
          <Button
            variant="yellow"
            onClick={() => setSelectedIds([])}
            className="text-slate-900 font-bold"
          >
            إلغاء الاختيار
          </Button>
          <span className="text-sm font-medium text-amber-800">
            {selectedIds.length} منتج(ات) مختارة
          </span>
          <Button
            variant="yellow"
            onClick={async () => {
              if (!marketplace) return;
              const response = await fetch(`/api/admin/marketplaces/${marketplace}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: selectedIds }),
              });
              if (!response.ok) {
                const text = await response.text();
                Swal.fire({ icon: 'error', title: 'فشل التصدير', text: text || 'Export failed' });
                return;
              }
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${marketplace}-selected-products.xlsx`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="text-slate-900 font-bold"
            disabled={selectedIds.length === 0}
          >
            تصدير المختارة إلى {marketplace === 'amazon' ? 'Amazon' : 'Noon'}
          </Button>
          <Button
            variant="yellow"
            onClick={async () => {
              const response = await fetch(`/api/admin/marketplaces/noon/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: selectedIds }),
              });
              if (!response.ok) {
                const text = await response.text();
                Swal.fire({ icon: 'error', title: 'فشل التصدير', text: text || 'Export failed' });
                return;
              }
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `noon-selected-products.xlsx`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="text-slate-900 font-bold ml-2"
            disabled={selectedIds.length === 0}
          >
            تصدير المختارة إلى Noon
          </Button>
        </div>
      )}

      {/* Smart Product Configurator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="large"
        title={editingId ? '✏️ تعديل بيانات المنتج وأسعار الكميات' : '✨ إضافة منتج جديد وتحديد التسعير الذكي'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-right px-1">
          {/* Section 1: Basic Info */}
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 space-y-3">
            <span className="text-xs font-black text-slate-700 block">📌 البيانات الأساسية</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المنتج (إنجليزي) *</label>
                <Input
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Roll-up Banner"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المنتج (عربي)</label>
                <Input
                  value={formData.nameAr || ''}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: رول اب بانر"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {formData.pricingType === 'meter' ? 'سعر المتر (ر.س) *' : 'السعر الأساسي للوحدة (ر.س) *'}
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.basePrice ?? ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">التصنيف *</label>
                <select
                  required
                  value={formData.categorySlug || ''}
                  onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.nameAr || category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">طريقة التسعير *</label>
                <select
                  required
                  value={formData.pricingType || 'quantity'}
                  onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as Product['pricingType'] })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="quantity">بالقطعة — الكمية × سعر الوحدة</option>
                  <option value="meter">بالمتر — الطول × سعر المتر</option>
                  <option value="tiered">شرائح — سعر محدد لكل كمية</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  المخزون المتاح {formData.pricingType === 'meter' ? '(متر)' : '(قطعة)'}
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  step={formData.pricingType === 'meter' ? '0.01' : '1'}
                  value={formData.stock ?? 0}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
                <p className="mt-1 text-[10px] text-slate-500">يُخصم المخزون تلقائياً عند تأكيد الطلب.</p>
              </div>
            </div>

            <MediaManager
              images={formData.images}
              videos={formData.videos}
              coverImage={formData.coverImage}
              onImagesChange={(images) => setFormData((current) => ({
                ...current,
                images,
                coverImage: images.some((image) => image.url === current.coverImage) ? current.coverImage : images[0]?.url || '',
              }))}
              onVideosChange={(videos) => setFormData((current) => ({ ...current, videos }))}
              onCoverImageChange={(coverImage) => setFormData((current) => ({ ...current, coverImage }))}
              onUploadStateChange={setIsMediaUploading}
            />

            {/* SKU Field */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-black text-slate-700">
                🏷️ رقم SKU (اختياري — يُولّد تلقائياً إن تُرك فارغاً)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.sku || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, sku: e.target.value });
                    setSkuError('');
                  }}
                  placeholder="ADL-26A7F3B (يُولّد تلقائياً)"
                  className={skuError ? 'border-rose-400 bg-rose-50' : ''}
                />
                {formData.sku && formData.sku.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...formData, sku: '' }); setSkuError(''); }}
                    className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                  >
                    توليد SKU جديد
                  </button>
                )}
              </div>
              {skuError && (
                <p className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  ⚠ {skuError}
                </p>
              )}
              {!skuError && !formData.sku?.trim() && (
                <p className="text-[10px] text-slate-500">
                  سيتم إنشاء رقم SKU فريد تلقائياً عند حفظ المنتج.
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Quantity Tiers Pricing */}
          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-300/60 space-y-3">
            <div className="flex justify-between items-center border-b border-amber-200 pb-2">
              <div>
                <span className="text-xs font-black text-amber-950 block">📦 إعداد الكميات والتسعير</span>
                <p className="text-[10px] text-amber-800 font-medium">
                  {formData.pricingType === 'tiered'
                    ? 'حدد الكمية والسعر الإجمالي الخاص بها.'
                    : formData.pricingType === 'meter'
                      ? 'يُحسب السعر بضرب عدد الأمتار في سعر المتر.'
                      : 'يُحسب السعر بضرب عدد القطع في سعر الوحدة.'}
                </p>
              </div>
              {formData.pricingType === 'tiered' && (
                <button
                  type="button"
                  onClick={handleAddQuantity}
                  className="text-[11px] font-black text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-xl shadow-xs"
                >
                  + إضافة شريحة كمية
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="max-w-xs">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  رسوم التصميم عند الطلب (ر.س)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.designFee ?? 75}
                  onChange={(e) => setFormData({ ...formData, designFee: Number(e.target.value) })}
                />
              </div>
              {formData.pricingType === 'tiered' && (formData.quantitiesList || []).map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 bg-white p-3 rounded-xl border border-amber-200/50">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600">الكمية</label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="100"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600">السعر قبل الخصم (ر.س)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="150"
                      value={item.unitPrice}
                      onChange={(e) => handleQuantityChange(idx, 'unitPrice', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600">الخصم (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                      value={item.discountPercent ?? 0}
                      onChange={(e) => handleQuantityChange(idx, 'discountPercent', Number(e.target.value))}
                    />
                    <span className="mt-1 block text-[10px] font-black text-emerald-700">
                      بعد الخصم: {formatCurrency((item.unitPrice || 0) * (1 - Math.min(100, Math.max(0, item.discountPercent || 0)) / 100))}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuantity(idx)}
                    className="text-rose-500 hover:bg-rose-100 p-2 rounded-xl text-xs font-bold"
                    aria-label="حذف شريحة الكمية"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formData.pricingType === 'tiered' && !formData.quantitiesList?.length && (
                <p className="text-xs font-semibold text-amber-900">أضيفي شريحة واحدة على الأقل لتفعيل هذا المنتج.</p>
              )}
            </div>
          </div>

          <div className="bg-cyan-50/60 p-4 rounded-2xl border border-cyan-200/70 space-y-4">
            <div className="border-b border-cyan-200 pb-2">
              <span className="text-xs font-black text-cyan-950 block">🖨️ خيارات تنفيذ المنتج</span>
              <p className="text-[10px] text-cyan-800">حددي أماكن التصميم، وجه الطباعة، وخيار التركيب.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-800">أماكن التصميم</label>
                <button
                  type="button"
                  onClick={() => handleAddOption('designPlacementsList')}
                  className="text-[10px] font-bold text-cyan-800 bg-cyan-100 hover:bg-cyan-200 px-2 py-1 rounded-lg"
                >
                  + إضافة مكان تصميم
                </button>
              </div>
              {(formData.designPlacementsList || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="مثال: الغلاف الأمامي"
                    value={option.label}
                    onChange={(e) => handleOptionChange('designPlacementsList', index, 'label', e.target.value)}
                  />
                  <div className="w-36">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="إضافة سعر (ر.س)"
                      value={option.priceModifier}
                      onChange={(e) => handleOptionChange('designPlacementsList', index, 'priceModifier', Number(e.target.value))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption('designPlacementsList', index)}
                    className="text-rose-500 hover:bg-rose-100 p-2 rounded-xl text-xs"
                    aria-label="حذف مكان التصميم"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-800">وجه الطباعة</label>
                <button
                  type="button"
                  onClick={() => handleAddOption('printSidesList')}
                  className="text-[10px] font-bold text-cyan-800 bg-cyan-100 hover:bg-cyan-200 px-2 py-1 rounded-lg"
                >
                  + إضافة وجه طباعة
                </button>
              </div>
              {(formData.printSidesList || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <Input
                      placeholder="مثال: وجه واحد أو وجهين"
                      value={option.label}
                      onChange={(e) => handleOptionChange('printSidesList', index, 'label', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="إضافة سعر (ر.س)"
                      value={option.priceModifier}
                      onChange={(e) => handleOptionChange('printSidesList', index, 'priceModifier', Number(e.target.value))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption('printSidesList', index)}
                    className="text-rose-500 hover:bg-rose-100 p-2 rounded-xl text-xs"
                    aria-label="حذف خيار وجه الطباعة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-800">اختيارات الإضاءة</label>
                <button
                  type="button"
                  onClick={() => handleAddOption('lightingList')}
                  className="text-[10px] font-bold text-cyan-800 bg-cyan-100 hover:bg-cyan-200 px-2 py-1 rounded-lg"
                >
                  + إضافة اختيار إضاءة
                </button>
              </div>
              {(formData.lightingList || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="مثال: بدون إضاءة أو إضاءة LED"
                    value={option.label}
                    onChange={(e) => handleOptionChange('lightingList', index, 'label', e.target.value)}
                  />
                  <div className="w-36">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="إضافة سعر (ر.س)"
                      value={option.priceModifier}
                      onChange={(e) => handleOptionChange('lightingList', index, 'priceModifier', Number(e.target.value))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption('lightingList', index)}
                    className="text-rose-500 hover:bg-rose-100 p-2 rounded-xl text-xs"
                    aria-label="حذف اختيار الإضاءة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-cyan-100 bg-white p-3 space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(formData.installationAvailable)}
                  onChange={(e) => setFormData({ ...formData, installationAvailable: e.target.checked })}
                  className="h-4 w-4 accent-cyan-600"
                />
                إتاحة خدمة التركيب للعميل
              </label>
              {formData.installationAvailable && (
                <div className="max-w-xs">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">سعر التركيب يبدأ من (ر.س)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.installationFee ?? 0}
                    onChange={(e) => setFormData({ ...formData, installationFee: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Material, Size, & Finish Pricing */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-4">
            <div className="border-b border-amber-200/80 pb-2">
              <span className="text-xs font-black text-amber-900 block">🎛️ زيادات الخامات والمقاسات (ر.س)</span>
            </div>

            {/* Materials */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-800">1. الخامات (Materials)</label>
                <button
                  type="button"
                  onClick={() => handleAddOption('materialsList')}
                  className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg"
                >
                  + إضافة خامة
                </button>
              </div>
              <div className="space-y-2">
                {(formData.materialsList || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="اسم الخامة"
                      value={item.label}
                      onChange={(e) => handleOptionChange('materialsList', idx, 'label', e.target.value)}
                    />
                    <div className="w-36 flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500">+</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="إضافة سعر"
                        value={item.priceModifier}
                        onChange={(e) => handleOptionChange('materialsList', idx, 'priceModifier', Number(e.target.value))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption('materialsList', idx)}
                      className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-xl text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-800">2. المقاسات (Sizes)</label>
                <button
                  type="button"
                  onClick={() => handleAddOption('sizesList')}
                  className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg"
                >
                  + إضافة مقاس
                </button>
              </div>
              <div className="space-y-2">
                {(formData.sizesList || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="المقاس"
                      value={item.label}
                      onChange={(e) => handleOptionChange('sizesList', idx, 'label', e.target.value)}
                    />
                    <div className="w-36 flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500">+</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="إضافة سعر"
                        value={item.priceModifier}
                        onChange={(e) => handleOptionChange('sizesList', idx, 'priceModifier', Number(e.target.value))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption('sizesList', idx)}
                      className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-xl text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Finishes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-800">3. التغليف واللمسات (Finishes)</label>
                <button
                  type="button"
                  onClick={() => handleAddOption('finishesList')}
                  className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg"
                >
                  + إضافة تغليف
                </button>
              </div>
              <div className="space-y-2">
                {(formData.finishesList || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="نوع التغليف"
                      value={item.label}
                      onChange={(e) => handleOptionChange('finishesList', idx, 'label', e.target.value)}
                    />
                    <div className="w-36 flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500">+</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="إضافة سعر"
                        value={item.priceModifier}
                        onChange={(e) => handleOptionChange('finishesList', idx, 'priceModifier', Number(e.target.value))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption('finishesList', idx)}
                      className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-xl text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-violet-50/60 p-4 rounded-2xl border border-violet-200/70 space-y-3">
            <div className="flex justify-between items-center border-b border-violet-200 pb-2">
              <div>
                <span className="text-xs font-black text-violet-950 block">🎨 لوحة ألوان المنتج</span>
                <p className="text-[10px] text-violet-800">اختاري طريقة تحديد اللون للعميل.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={formData.colorSelectionMode === 'custom'}
                onClick={() => setFormData((prev) => ({ ...prev, colorSelectionMode: 'custom' }))}
                className={`rounded-xl border p-3 text-right text-xs font-bold ${
                  formData.colorSelectionMode === 'custom' ? 'border-violet-500 bg-white text-violet-900 ring-2 ring-violet-100' : 'border-violet-200 bg-white/60 text-slate-600'
                }`}
              >
                اختيار حر من لوحة الألوان
                <span className="mt-1 block text-[10px] font-medium">العميل يختار أي درجة لون.</span>
              </button>
              <button
                type="button"
                aria-pressed={formData.colorSelectionMode === 'predefined'}
                onClick={() => setFormData((prev) => ({ ...prev, colorSelectionMode: 'predefined' }))}
                className={`rounded-xl border p-3 text-right text-xs font-bold ${
                  formData.colorSelectionMode === 'predefined' ? 'border-violet-500 bg-white text-violet-900 ring-2 ring-violet-100' : 'border-violet-200 bg-white/60 text-slate-600'
                }`}
              >
                ألوان محددة مسبقاً
                <span className="mt-1 block text-[10px] font-medium">العميل يختار من الألوان التي تضيفينها.</span>
              </button>
            </div>
            {formData.colorSelectionMode === 'predefined' && (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      colorsList: [...(prev.colorsList || []), { label: '', hex: '#000000' }],
                    }))}
                    className="text-[11px] font-black text-white bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-xl"
                  >
                    + إضافة لون محدد
                  </button>
                </div>
                {(formData.colorsList || []).map((color, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-violet-100">
                    <input
                      type="color"
                      aria-label="اختيار لون"
                      value={color.hex}
                      onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                      className="h-10 w-12 rounded-lg border border-slate-200 bg-white p-1"
                    />
                    <Input
                      required
                      placeholder="اسم اللون"
                      value={color.label}
                      onChange={(e) => handleColorChange(index, 'label', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        colorsList: (prev.colorsList || []).filter((_, itemIndex) => itemIndex !== index),
                      }))}
                      className="text-rose-500 hover:bg-rose-100 p-2 rounded-xl text-xs"
                      aria-label="حذف اللون"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {!formData.colorsList?.length && (
                  <p className="text-[11px] text-violet-700">أضيفي لوناً واحداً على الأقل لاستخدام الألوان المحددة.</p>
                )}
              </>
            )}
          </div>
<div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
    <span className="text-xs font-black">
        ظهور المنتج في الصفحة الرئيسية
    </span>

    <div className="grid grid-cols-2 gap-4">

        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e)=>setFormData({
                    ...formData,
                    featured:e.target.checked
                })}
            />
            منتج مميز
        </label>

        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={formData.bestseller}
                onChange={(e)=>setFormData({
                    ...formData,
                    bestseller:e.target.checked
                })}
            />
            الأكثر مبيعاً
        </label>

        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={formData.mostUsed}
                onChange={(e)=>setFormData({
                    ...formData,
                    mostUsed:e.target.checked
                })}
            />
            الأكثر استخداماً
        </label>

        <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={formData.newArrival}
                onChange={(e)=>setFormData({
                    ...formData,
                    newArrival:e.target.checked
                })}
            />
            أحدث المنتجات
        </label>

    </div>
</div>
          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">وصف المنتج *</label>
            <textarea
              required
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصفاً شاملاً للمنتج..."
              className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 outline-none"
            />
          </div>
          

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              إلغاء
            </button>
            <Button
              type="submit"
              variant="yellow"
              disabled={isSubmitting || isMediaUploading}
              className={`text-slate-900 font-black px-6 py-2.5 text-xs rounded-2xl transition-all ${isSubmitting ? 'bg-amber-200 cursor-not-allowed opacity-70' : 'bg-amber-400 hover:bg-amber-300'}`}
            >
              {isSubmitting
                ? (editingId ? 'جاري حفظ التعديلات...' : 'جاري إنشاء المنتج...')
                : isMediaUploading
                  ? 'انتظر حتى يكتمل رفع الوسائط...'
                : (editingId ? 'حفظ التعديلات ✨' : 'حفظ المنتج ✨')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}