import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AssetService } from '../../../asset/asset.service';
import { Asset } from '../../../asset/interfaces/asset.interface';

@Component({
  selector: 'app-my-assets',
  imports: [RouterLink],
  templateUrl: './my-assets.html',
  styleUrl: './my-assets.css',
})
export class MyAssets {
  private readonly _assetService = inject(AssetService);

  assets = signal<Asset[]>([]);
  isLoading = signal(true);

  constructor() {
    this._assetService.getMy(0, 20).subscribe({
      next: (response) => {
        this.assets.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}