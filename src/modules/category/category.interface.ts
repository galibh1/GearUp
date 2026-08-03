export interface ICreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface IUpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}