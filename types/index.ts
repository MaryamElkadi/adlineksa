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
  unitPrice: number;  // Total price for this exact quantity
  discountPercent?: number;
}

export interface ProductColor {
  label: string;
  hex: string;
}

export interface ImageMedia {
  url: string;
  publicId?: string;
  alt?: string;
  sortOrder: number;
}

export interface VideoMedia {
  url: string;
  publicId?: string;
  thumbnailUrl?: string;
  provider: "cloudinary" | "youtube" | "vimeo";
  title?: string;
  sortOrder: number;
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
  images?: ImageMedia[];
  videos?: VideoMedia[];
  coverImage?: string;

  // Pricing
  basePrice: number;
  pricingType?: 'quantity' | 'tiered' | 'meter';
  colorSelectionMode?: 'custom' | 'predefined';
  configurableDesignPlacements?: ConfigOption[];
  configurablePrintSides?: ConfigOption[];
  configurableLighting?: ConfigOption[];
  installationAvailable?: boolean;
  installationFee?: number;
  designFee?: number;
  salePrice?: number;
  discount?: number;

  // Configurator Options (With Custom Price Additions)
  configurableMaterials?: ConfigOption[];
  configurableSizes?: ConfigOption[];
  configurableFinishes?: ConfigOption[];
  configurableQuantityTiers?: QuantityTier[]; // Specific pricing per quantity tier
  colors?: ProductColor[];
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
  mostUsed?: boolean;
  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Dates
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  shortDescription?: string;
  shortDescriptionAr?: string;
  image?: string;
  gallery?: string[];
  images?: ImageMedia[];
  videos?: VideoMedia[];
  coverImage?: string;
  icon?: string;
  category: string;
  price?: number;
  priceLabel?: string;
  relatedProductIds?: string[];
  featured?: boolean;
  showInHero?: boolean;
  showOnHomepage?: boolean;
  active?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exhibition {
  id: string; title: string; titleAr: string; slug: string; description: string; descriptionAr: string; shortDescription?: string; shortDescriptionAr?: string;
  image: string; gallery: string[]; images?: ImageMedia[]; videos?: VideoMedia[]; coverImage?: string; category: string; categoryAr?: string; location?: string; locationAr?: string; date?: string; endDate?: string; price?: number; priceLabel?: string;
  features?: string[]; featuresAr?: string[]; services?: string[]; servicesAr?: string[]; relatedServiceIds?: string[]; relatedProductIds?: string[];
  featured?: boolean; showOnHomepage?: boolean; active?: boolean; sortOrder?: number; createdAt?: string; updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  size: string;
  material: string;
  color?: string;
  colorHex?: string;
  designPlacement?: string;
  finish?: string;
  printSide?: string;
  lighting?: string;
  installation?: boolean;
  needDesign?: boolean;
  designBrief?: string;
  pricingType?: 'quantity' | 'tiered' | 'meter';
  quantity: number;
  maxStock?: number;
  unitPrice: number;
  totalPrice: number;
  customNotes?: string;
  fileUrl?: string;
}

export interface UserOrder {
  id: string;
  userId?: string;
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
