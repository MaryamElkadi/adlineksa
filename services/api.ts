import { CartItem, Category, Exhibition, Product, Service, UserOrder } from "@/types";

interface LoginResponse {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: "admin" | "user";
  };
}

interface SignupResponse extends LoginResponse {}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "The request could not be completed.");
  }

  return response.status === 204
    ? (undefined as T)
    : response.json();
}

export const api = {
  // Categories
  getCategories: () =>
    request<Category[]>("/api/categories"),

  // Products
  getProducts: (categorySlug?: string) =>
    request<Product[]>(
      `/api/products${
        categorySlug
          ? `?category=${encodeURIComponent(categorySlug)}`
          : ""
      }`
    ),

  getProduct: (id: string) =>
    request<Product>(`/api/products/${id}`),

  getServices: (category?: string) => request<Service[]>(`/api/services${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getService: (id: string) => request<Service>(`/api/services/${id}`),
  getHomepageServices: () => request<Service[]>("/api/services/homepage"),
  getFeaturedServices: (limit = 8) => request<Service[]>(`/api/services/featured?limit=${limit}`),
  getExhibitions: (category?: string) => request<Exhibition[]>(`/api/exhibitions${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getExhibition: (id: string) => request<Exhibition>(`/api/exhibitions/${id}`),
  getHomepageExhibitions: () => request<Exhibition[]>("/api/exhibitions/homepage"),

  // Orders
  createOrder: (orderData: {
    items: CartItem[];
    total: number;
    shippingAddress: string;
    customer: NonNullable<UserOrder["customer"]>;
    paymentMethod: NonNullable<UserOrder["paymentMethod"]>;
  }) =>
    request<UserOrder>("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  // Authentication
signup: (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) =>
  request<{
    success: boolean;
    user: any;
  }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  login: (data: {
    email: string;
    password: string;
  }) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () =>
    request<LoginResponse>("/api/auth/me"),

  logout: () =>
    request("/api/auth/logout", {
      method: "POST",
    }),
    getMyOrders: () =>
  request("/api/orders"),

getMyQuotes: () =>
  request("/api/quotations"),
getMyArtworks: () =>
  request("/api/artworks"),

getMyTickets: () =>
  request("/api/tickets"),
};
