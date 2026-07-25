export interface Category{

id:string

name:string

nameAr:string

slug:string

description:string

image:string

banner?:string

icon?:string

featured?:boolean

active?:boolean

sortOrder?:number

seoTitle?:string

seoDescription?:string

itemCount?: number

}
export interface ProductAttributeOption {
  id: string;
  name: string;
  priceModifier: number; // percentage or fixed delta
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'select' | 'radio' | 'color' | 'number';
  options: ProductAttributeOption[];
}
export interface ConfigOption {
  label: string;
  priceModifier: number; // e.g. +10, +25, or 0
}

export interface QuantityTier {
  quantity: number;   // e.g. 100, 250, 500
  unitPrice: number;  // e.g. 5.50 EGP per unit
}



export interface Product {
  // Basic Information
  id: string;
  name: string;
  nameAr: string;
  slug: string;

  // Category
  categorySlug: string;
  categoryId?: string;

  // Descriptions
  description: string;
  shortDescription?: string;

  // Brand & SKU
  brand?: string;
  sku?: string;

  // Images
  image: string;
  gallery: string[];

  // Pricing
  basePrice: number;
  salePrice?: number;
  discount?: number;

  // Configurator Options (With Custom Price Additions)
  configurableMaterials?: ConfigOption[];
  configurableSizes?: ConfigOption[];
  configurableFinishes?: ConfigOption[];
  configurableQuantityTiers?: QuantityTier[]; // Specific pricing per quantity tier
  quantityTiers?: number[];                  // Backward compatibility fallback

  // Reviews
  rating: number;
  reviewCount: number;

  // Inventory
  stock?: number;
  minQuantity: number;
  maxQuantity?: number;

  // Product Options (Keep compatibility)
  availableSizes: string[];
  materials: string[];
  options?: ProductAttribute[];

  // Product Status
  badge?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  active?: boolean;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Dates
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  size: string;
  material: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customNotes?: string;
  fileUrl?: string;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Pending' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  itemsCount: number;
  items: CartItem[];
  shippingAddress: string;
  customer?: {
    fullName: string;
    email: string;
    phone: string;
  };
  paymentMethod?: 'mada' | 'applepay' | 'stcpay' | 'invoice';
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}
