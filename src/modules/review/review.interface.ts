export interface ICreateReviewPayload {
  rentalOrderId: string;
  gearItemId: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export interface IReviewQuery {
  page: number;
  limit: number;
  sortOrder: "asc" | "desc";
}

export interface IReviewPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}