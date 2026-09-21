import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { PurchaseService } from '../../purchase.service';
import { Purchase } from '../../interfaces/purchase.interface';

@Component({
  selector: 'app-my-purchases',
  imports: [],
  templateUrl: './my-purchases.html',
  styleUrl: './my-purchases.css',
})
export class MyPurchases implements OnInit {
  private readonly _purchaseService = inject(PurchaseService);

  purchases = signal<Purchase[]>([]);
  total = signal(0);
  isLoading = signal(true);

  readonly limit = 3;
  currentPage = signal(0);

  totalPages = computed(() => Math.ceil(this.total() / this.limit));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }));

  ngOnInit(): void {
    this._loadPurchases();
  }

  private _loadPurchases(): void {
    this.isLoading.set(true);

    this._purchaseService
      .getMyPurchases(this.currentPage() * this.limit, this.limit)
      .subscribe({
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

  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this._loadPurchases();
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