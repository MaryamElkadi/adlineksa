import { CartItem, Category, Product, UserOrder } from "@/types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "The request could not be completed.");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  getCategories: () => request<Category[]>("/api/categories"),
  getProducts: (categorySlug?: string) => request<Product[]>(`/api/products${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ""}`),
  createOrder: (orderData: { items: CartItem[]; total: number; shippingAddress: string; customer: NonNullable<UserOrder["customer"]>; paymentMethod: NonNullable<UserOrder["paymentMethod"]> }) =>
    request<UserOrder>("/api/orders", { method: "POST", body: JSON.stringify(orderData) }),
};
