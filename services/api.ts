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
let cachedCategoriesPromise: Promise<Category[]> | null = null;

export const api = {
  // Categories (cached in-memory to prevent duplicate requests across components)
  getCategories: () => {
    if (!cachedCategoriesPromise) {
      cachedCategoriesPromise = request<Category[]>("/api/categories").catch((err) => {
        cachedCategoriesPromise = null;
        throw err;
      });
    }
    return cachedCategoriesPromise;
  },

  // Clear categories cache if needed
  invalidateCategoriesCache: () => {
    cachedCategoriesPromise = null;
  },

  // Products with optional server-side filtering, compact projection, and pagination
  getProducts: (
    params?:
      | string
      | {
          category?: string;
          search?: string;
          page?: number;
          limit?: number;
          compact?: boolean;
          format?: string;
        }
  ) => {
    let url = "/api/products";
    if (typeof params === "string") {
      url += `?category=${encodeURIComponent(params)}`;
    } else if (params) {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.set("category", params.category);
      if (params.search) searchParams.set("search", params.search);
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.compact !== undefined) searchParams.set("compact", params.compact ? "true" : "false");
      if (params.format) searchParams.set("format", params.format);
      const queryStr = searchParams.toString();
      if (queryStr) url += `?${queryStr}`;
    }
    return request<any>(url);
  },

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
