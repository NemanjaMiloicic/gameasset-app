export interface Asset {
  id: string;
  title: string;
  description: string;
  assetType: string;
  price: string;
  licenseType: string;
  previewImageUrl: string | null;
  tags: string[] | null;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
}