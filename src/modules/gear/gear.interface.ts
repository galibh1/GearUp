import type {
  GearCondition,
  GearStatus,
} from "../../../generated/prisma/enums";

export interface ICreateGearPayload {
  name: string;
  slug: string;
  description: string;
  brand?: string;

  pricePerDay: number;
  depositAmount?: number;

  stock: number;
  availableStock?: number;

  condition?: GearCondition;
  status?: GearStatus;

  imageUrls?: string[];
  specifications?: Record<string, unknown>;
  location?: string;
  isFeatured?: boolean;

  categoryId: string;
}

export interface IUpdateGearPayload {
  name?: string;
  slug?: string;
  description?: string;
  brand?: string | null;

  pricePerDay?: number;
  depositAmount?: number;

  stock?: number;
  availableStock?: number;

  condition?: GearCondition;
  status?: GearStatus;

  imageUrls?: string[];
  specifications?: Record<string, unknown> | null;
  location?: string | null;
  isFeatured?: boolean;

  categoryId?: string;
}

export interface IGearQuery {
  search?: string;
  categoryId?: string;
  category?: string;
  brand?: string;

  condition?: GearCondition;
  status?: GearStatus;

  minPrice?: number;
  maxPrice?: number;

  available?: boolean;
  isFeatured?: boolean;

  page: number;
  limit: number;

  sortBy:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "pricePerDay";

  sortOrder: "asc" | "desc";
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}