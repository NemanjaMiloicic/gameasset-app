export interface Purchase {
  id: string;
  asset: {
    id: string;
    title: string;
    previewImageUrl: string | null;
    licenseType: string;
  };
  pricePaid: string;
  purchasedAt: string;
}