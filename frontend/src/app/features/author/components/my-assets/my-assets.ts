import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AssetService } from '../../../asset/asset.service';
import { Asset } from '../../../asset/interfaces/asset.interface';

@Component({
  selector: 'app-my-assets',
  imports: [RouterLink],
  templateUrl: './my-assets.html',
  styleUrl: './my-assets.css',
})
export class MyAssets implements OnInit {
  private readonly _assetService = inject(AssetService);

  assets = signal<Asset[]>([]);
  total = signal(0);
  isLoading = signal(true);

  readonly limit = 3;
  currentPage = signal(0);

  totalPages = computed(() => Math.ceil(this.total() / this.limit));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }));

  ngOnInit(): void {
    this._loadAssets();
  }

  private _loadAssets(): void {
    this.isLoading.set(true);

    this._assetService
      .getMy(this.currentPage() * this.limit, this.limit)
      .subscribe({
        next: (response) => {
          this.assets.set(response.data);
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
    this._loadAssets();
  }
}