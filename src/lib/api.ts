// src\lib\api.ts
import { Category, Product, Review, ReviewPayload, ApiResponse, ProductFilters } from "@/types/api";

export interface OrderPayload {
  productId: number;
  quantity: number;
  totalAmount: number;
  size: string;
  name: string;
  surName: string;
  city: string;
  address: string;
  contact: string;
  status?: string;
  country?: string;
  countryPrice1?: number | null;
  countryPrice2?: number | null;
  color?: number | null;
  selectedShippingPrice?: number | null;
  selectedShippingMethod?: string | null;
}

export interface Order extends OrderPayload {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}


const BASE_URL = 'https://back.testwebapp.space/';

export const api = {
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${BASE_URL}getCata`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    const result = await response.json();
    return result.data || [];
  },

  async filterProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const response = await fetch(`${BASE_URL}filterProducts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error("Failed to fetch products");
    const result: ApiResponse<Product[]> = await response.json();
    return result.data || [];
  },

  async filterReviews(filters: { approved: boolean; productId: number }): Promise<Review[]> {
    const response = await fetch(`${BASE_URL}filterReviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error("Failed to fetch reviews");
    const result: ApiResponse<Review[]> = await response.json();
    return result.data || [];
  },

  async addReview(payload: ReviewPayload): Promise<Review> {
    const response = await fetch(`${BASE_URL}addReview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to add review");
    const result: ApiResponse<Review> = await response.json();
    return result.data;
  },

  async getProductById(id: number): Promise<Product | null> {
    const response = await fetch(`${BASE_URL}filterProducts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Failed to fetch product");
    const result: ApiResponse<Product[]> = await response.json();
    return result.data && result.data.length > 0 ? result.data[0] : null;
  },

  async addOrder(payload: OrderPayload): Promise<Order> {
    const response = await fetch(`${BASE_URL}addOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to add order");
    const result: ApiResponse<Order> = await response.json();
    return result.data;
  },

  async filterOrders(payload: Record<string, unknown> = { cataId: 1 }): Promise<Order[]> {
    const response = await fetch(`${BASE_URL}filterOrders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to fetch data from filterOrders");
    const result: ApiResponse<Order[]> = await response.json();
    return result.data || [];
  },

  async getProducts(): Promise<Product[]> {
    return this.filterProducts({ cataId: 1 });
  }
};

export const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};
