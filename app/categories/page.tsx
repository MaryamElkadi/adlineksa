import React from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import { CategoryCard } from '@/components/cards/CategoryCard';
import type { Category as CategoryType } from '@/types';

export const revalidate = 300;

async function getCategories(): Promise<CategoryType[]> {
  try {
    await connectToDatabase();
    const categories = await Category.aggregate([
      { $match: { active: { $ne: false } } },
      { $sort: { sortOrder: 1, name: 1 } },
      {
        $lookup: {
          from: 'products',
          let: { catSlug: '$slug' },
          pipeline: [
            { $match: { $expr: { $eq: ['$categorySlug', '$$catSlug'] }, active: { $ne: false } } },
            { $project: { _id: 1 } },
          ],
          as: 'products',
        },
      },
      {
        $project: {
          name: 1,
          nameAr: 1,
          slug: 1,
          image: 1,
          sortOrder: 1,
          active: 1,
          itemCount: { $size: '$products' },
        },
      },
    ]);

    return categories.map((cat: any) => ({
      id: cat._id.toString(),
      name: cat.name,
      nameAr: cat.nameAr,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image,
      sortOrder: cat.sortOrder,
      active: cat.active,
      itemCount: cat.itemCount,
    }));
  } catch (error) {
    console.error('Could not load categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  const activeCategories = categories.filter((category) => category.active !== false);

  const featuredCategories = activeCategories
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    .slice(0, 6);

  const remainingCategories = activeCategories
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    .slice(6);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
          دليل المنتجات
        </span>
        <h1 className="text-4xl font-black text-slate-800">
          فئات الطباعة
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          تصفح مجموعتنا الكاملة من خدمات الأوفست الرقمي، الطباعة الخارجية العريضة، التغليف، والهدايا الترويجية للشركات.
        </p>
      </div>

      {/* Featured Categories */}
      <div className="mb-12">
        <h3 className="text-2xl font-black text-brand-blue mb-6">
          ⭐ أهم الفئات
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {featuredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* All Categories */}
      <div>
        <h3 className="text-2xl font-black text-brand-blue mb-6">
          📂 جميع الفئات
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {remainingCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}