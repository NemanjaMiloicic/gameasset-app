import { Component, inject, signal } from '@angular/core';
import { PurchaseService } from '../../purchase.service';
import { Purchase } from '../../interfaces/purchase.interface';

@Component({
  selector: 'app-my-purchases',
  imports: [],
  templateUrl: './my-purchases.html',
  styleUrl: './my-purchases.css',
})
export class MyPurchases {
  
  private readonly _purchaseService = inject(PurchaseService);

  purchases = signal<Purchase[]>([]);
  total = signal(0);
  isLoading = signal(true);

  constructor() {
    this._purchaseService.getMyPurchases(0, 20).subscribe({
      next: (response) => {
        this.purchases.set(response.data);
        this.total.set(response.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onDownload(purchaseId: string): void {
    this._purchaseService.downloadPurchase(purchaseId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'asset.zip';
        link.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }
}