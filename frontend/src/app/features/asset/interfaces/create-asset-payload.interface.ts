export interface CreateAssetPayload {
  title: string;
  description: string;
  assetType: string;
  price: number;
  licenseType: string;
  tags: string[];
}