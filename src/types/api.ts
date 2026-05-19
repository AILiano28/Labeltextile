// src\types\api.ts
import { z } from "zod";

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Product {
  id: number;
  cataId: number;
  title: string;
  subTitle: string;
  description: string;
  colors: string[];
  price: number;
  discountPrice: number;
  stock: number;
  favourite: boolean;
  sizeInfo: Record<string, unknown>;
  colorsImages?: string | { color: number; imageIndex: number }[] | null;
  otherInfo: Record<string, unknown>;
  images: string | string[];
  tableImage: string;
  cata_name?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviewsCount?: number;
}

export const ReviewSchema = z.object({
  productId: z.number(),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "التعليق يجب أن يكون 5 أحرف على الأقل"),
  approved: z.boolean(),
});

export type ReviewPayload = z.infer<typeof ReviewSchema>;

export interface Review extends ReviewPayload {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  cataId?: number;
  favourite?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
