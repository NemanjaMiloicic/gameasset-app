export interface AuthorAnalytics {
  totalEarnings: number;
  totalPurchases: number;
  purchasesLast30Days: number;
  topAsset: {
    id: string;
    title: string;
    totalEarned: number;
    purchaseCount: number;
  } | null;
}