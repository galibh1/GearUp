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