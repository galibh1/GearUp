import type { RentalStatus } from "../../../generated/prisma/enums";

export interface IRentalItemPayload {
  gearItemId: string;
  quantity: number;
}

export interface ICreateRentalPayload {
  startDate: string;
  endDate: string;
  notes?: string;
  items: IRentalItemPayload[];
}

export interface IRentalQuery {
  status?: RentalStatus;

  page: number;
  limit: number;

  sortOrder: "asc" | "desc";
}

export type ProviderRentalStatus =
  | "CONFIRMED"
  | "PICKED_UP"
  | "RETURNED";

export interface IUpdateRentalStatusPayload {
  status: ProviderRentalStatus;
}

export interface IRentalPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}