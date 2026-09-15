export interface AssetFilters {
  skip: number;
  limit: number;
  search?: string;
  assetType?: string;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  tags?: string;
}