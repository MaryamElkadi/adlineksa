'use client';

import React, { useEffect, useState } from 'react';
import { Category, Product, ConfigOption, QuantityTier } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import Swal from 'sweetalert2';

const defaultImage = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80';

interface ProductFormState extends Partial<Product> {
  materialsList: ConfigOption[];
  sizesList: ConfigOption[];
  finishesList: ConfigOption[];
  quantitiesList: QuantityTier[];
  imageMode: 'upload' | 'url';
}

const initialFormState: ProductFormState = {
  name: '',
  nameAr: '',
  slug: '',
  categorySlug: '',
  basePrice: 100,
  salePrice: undefined,
  discount: 0,
  minQuantity: 1,
  maxQuantity: undefined,
  stock: undefined,
  description: '',
  shortDescription: '',
  brand: '',
  sku: '',
  image: '',
  imageMode: 'upload',
  gallery: [],
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
  quantitiesList: [
    { quantity: 100, unitPrice: 10 },
    { quantity: 250, unitPrice: 8.5 },
    { quantity: 500, unitPrice: 7 },
    { quantity: 1000, unitPrice: 5 },
  ],
  seoTitle: '',
  seoDescription: '',
};

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ProductFormState>(initialFormState);

  const load = async () => {
    try {
      const [products, categoryList] = await Promise.all([api.getProducts(), api.getCategories()]);
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

  const handleOpenEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      ...product,
      imageMode: product.image?.startsWith('data:') ? 'upload' : 'url',
      materialsList: product.configurableMaterials?.length
        ? product.configurableMaterials
        : (product.materials || []).map((m) => ({ label: m, priceModifier: 0 })),
      sizesList: product.configurableSizes?.length
        ? product.configurableSizes
        : (product.availableSizes || []).map((s) => ({ label: s, priceModifier: 0 })),
      finishesList: product.configurableFinishes || [],
      quantitiesList: product.configurableQuantityTiers?.length
        ? product.configurableQuantityTiers
        : (product.quantityTiers || []).map((q) => ({ quantity: q, unitPrice: product.basePrice || 0 })),
    });
    setIsModalOpen(true);
  };

  // Image Upload File Handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Option Handlers
  const handleAddOption = (key: 'materialsList' | 'sizesList' | 'finishesList') => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { label: '', priceModifier: 0 }],
    }));
  };

  const handleRemoveOption = (key: 'materialsList' | 'sizesList' | 'finishesList', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (
    key: 'materialsList' | 'sizesList' | 'finishesList',
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

  const handleQuantityChange = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    setFormData((prev) => {
      const updated = [...(prev.quantitiesList || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, quantitiesList: updated };
    });
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const autoSlug =
      formData.slug ||
      formData.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      '';

    const cleanMaterials = (formData.materialsList || []).filter((m) => m.label.trim() !== '');
    const cleanSizes = (formData.sizesList || []).filter((s) => s.label.trim() !== '');
    const cleanFinishes = (formData.finishesList || []).filter((f) => f.label.trim() !== '');
    const cleanQuantities = (formData.quantitiesList || [])
      .filter((q) => q.quantity > 0)
      .sort((a, b) => a.quantity - b.quantity);

    // Fallback to default placeholder image if left empty
    const finalImage = formData.image?.trim() || defaultImage;

    const payload = {
      ...formData,
      slug: autoSlug,
      image: finalImage,
      gallery: formData.gallery?.length ? formData.gallery : [finalImage],
      basePrice: Number(formData.basePrice) || 0,
      salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
      discount: formData.discount ? Number(formData.discount) : 0,
      minQuantity: Number(formData.minQuantity) || 1,

      configurableMaterials: cleanMaterials,
      configurableSizes: cleanSizes,
      configurableFinishes: cleanFinishes,
      configurableQuantityTiers: cleanQuantities,

      materials: cleanMaterials.map((m) => m.label),
      availableSizes: cleanSizes.map((s) => s.label),
      quantityTiers: cleanQuantities.map((q) => q.quantity),
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
        throw new Error(resData.message || 'فشل حفظ المنتج.');
      }

      await Swal.fire({
        icon: 'success',
        title: editingId ? 'تم تعديل المنتج بنجاح! ✨' : 'تم إضافة المنتج بالحاسبة الذكية! 🎉',
        timer: 2000,
        showConfirmButton: false,
      });

      setIsModalOpen(false);
      void load();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ.');
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
            ✨ الحاسبة الذكية وتسعير الكميات
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">إدارة أسعار الخيارات وشرائح الكميات</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            تحديد أسعار مخصصة لكل كمية وإضافات الخامات والمقاسات.
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
                <th className="p-4">المنتج</th>
                <th className="p-4">الفئة</th>
                <th className="p-4">السعر الأساسي</th>
                <th className="p-4">شرائح الكميات</th>
                <th className="p-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productList.map((product) => (
                <tr key={product.id} className="hover:bg-amber-50/30 transition-colors">
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
                  <td className="p-4 font-black text-amber-600 text-sm">{formatCurrency(product.basePrice)}</td>
                  <td className="p-4">
                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {product.configurableQuantityTiers?.length || product.quantityTiers?.length || 0} شرائح أسعار
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Product Configurator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? '✏️ تعديل بيانات المنتج وأسعار الكميات' : '✨ إضافة منتج جديد وتحديد التسعير الذكي'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-right max-h-[80vh] overflow-y-auto px-1">
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">السعر الأساسي المفرد (Base Price) *</label>
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

            {/* Flexible Image Section (Upload or URL - Optional) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-black text-slate-700">
                  🖼️ صورة المنتج (اختياري - Optional)
                </label>
                {/* Toggle Buttons */}
                <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageMode: 'upload' })}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      formData.imageMode === 'upload' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    رفع صورة 📁
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageMode: 'url' })}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      formData.imageMode === 'url' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    رابط URL 🔗
                  </button>
                </div>
              </div>

              {formData.imageMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                  />
                </div>
              ) : (
                <Input
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              )}

              {/* Image Preview */}
              {formData.image && (
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={formData.image}
                    alt="معاينة الصورة"
                    className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                  />
                  <span className="text-[10px] font-bold text-slate-500">معاينة الصورة الحالية</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="text-[10px] font-bold text-rose-500 hover:underline mr-auto"
                  >
                    حذف الصورة
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Quantity Tiers Pricing */}
          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-300/60 space-y-3">
            <div className="flex justify-between items-center border-b border-amber-200 pb-2">
              <div>
                <span className="text-xs font-black text-amber-950 block">📦 شرائح الكميات وسعر القطعة لكل كمية</span>
                <p className="text-[10px] text-amber-800 font-medium">حدد سعر القطعة (Unit Price) بناءً على الكمية</p>
              </div>
              <button
                type="button"
                onClick={handleAddQuantity}
                className="text-[11px] font-black text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-xl shadow-xs"
              >
                + إضافة شريحة كمية
              </button>
            </div>

            <div className="space-y-2">
              {(formData.quantitiesList || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-200/50">
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">الكمية:</span>
                    <Input
                      type="number"
                      placeholder="100"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">السعر لهذه الكمية (ر.س):</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="150"
                      value={item.unitPrice}
                      onChange={(e) => handleQuantityChange(idx, 'unitPrice', Number(e.target.value))}
                    />
                  </div>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg whitespace-nowrap">
                    السعر المحدد: {formatCurrency(item.unitPrice || 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuantity(idx)}
                    className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-xl text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Material, Size, & Finish Pricing */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-4">
            <div className="border-b border-amber-200/80 pb-2">
              <span className="text-xs font-black text-amber-900 block">🎛️ زيادات الخامات والمقاسات (+EGP)</span>
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
              className="text-slate-900 font-black px-6 py-2.5 text-xs rounded-2xl bg-amber-400 hover:bg-amber-300"
            >
              {editingId ? 'حفظ التعديلات ✨' : 'حفظ المنتج ✨'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}