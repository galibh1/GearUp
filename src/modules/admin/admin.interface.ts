import type {
  ActiveStatus,
  Role,
} from "../../../generated/prisma/client";

export type AdminUserRoleFilter =
  | Extract<
      Role,
      "CUSTOMER" | "PROVIDER"
    >
  | "ALL";

export type AdminUserStatusFilter =
  | ActiveStatus
  | "ALL";

export type AdminUserSortBy =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "email";

export type SortOrder =
  | "asc"
  | "desc";


export interface IAdminUserQuery {
  searchTerm?: string;

  role: AdminUserRoleFilter;

  activeStatus: AdminUserStatusFilter;

  page: number;

  limit: number;

  sortBy: AdminUserSortBy;

  sortOrder: SortOrder;
}


export interface IUpdateUserStatusPayload {
  activeStatus: ActiveStatus;
}


export interface IAdminPaginationMeta {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}


/**
 * Admin gear listing filters
 *
 * GET /api/admin/gear
 */
export interface IAdminGearQuery {
  searchTerm?: string;

  categoryId?: string;

  providerId?: string;

  page: number;

  limit: number;

  sortOrder: SortOrder;
}


/**
 * Admin rental overview filters
 *
 * GET /api/admin/rentals
 */
export interface IAdminRentalQuery {
  status?:
    | "PLACED"
    | "CONFIRMED"
    | "PAID"
    | "PICKED_UP"
    | "RETURNED"
    | "CANCELLED";

  customerId?: string;

  providerId?: string;

  page: number;

  limit: number;

  sortOrder: SortOrder;
}