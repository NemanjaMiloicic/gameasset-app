import { Component, inject, effect, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap } from 'rxjs';
import { selectAssetById } from '../../store/asset.selectors';
import * as AssetActions from '../../store/asset.actions';
import { PurchaseService } from '../../../purchase/purchase.service';
import { selectIsAuthenticated } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-asset-detail',
  imports: [RouterLink],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetail {
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);
  private readonly _purchaseService = inject(PurchaseService);

  private readonly _isAuthenticated = this._store.selectSignal(selectIsAuthenticated);

  isProcessing = signal(false);
  actionError = signal('');


  constructor() {
    effect(() => {
      const id = this._route.snapshot.paramMap.get('id');
      const current = this.assetWithOwnership();
      if (id && (!current || !current[0])) {
        this._store.dispatch(AssetActions.loadAssetById({ id }));
      }
    });
  }

  assetWithOwnership = toSignal(
    this._route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id')!;
        const asset$ = this._store.select(selectAssetById(id));

        const owned$ = this._isAuthenticated()
          ? this._purchaseService.checkOwnership(id)
          : of({ owned: false, purchaseId: null });

        return combineLatest([asset$, owned$]);
      })
    )
  );


  onBuyFree(assetId: string): void {
    if (!this._isAuthenticated()) {
      this._router.navigate(['/auth/login']);
      return;
    }

    this.isProcessing.set(true);
    this._purchaseService.buyFree(assetId).subscribe({
      next: () => {
        this.isProcessing.set(false);
        window.location.reload();
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionError.set(err.error?.message ?? 'Failed to get asset');
      },
    });
  }

  onBuyPaid(assetId: string): void {
    if (!this._isAuthenticated()) {
      this._router.navigate(['/auth/login']);
      return;
    }

    this.isProcessing.set(true);
    this._purchaseService.initiatePaidPurchase(assetId).subscribe({
      next: (response) => {
        window.location.href = response.checkoutUrl;
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionError.set(err.error?.message ?? 'Failed to start checkout');
      },
    });
  }

  onDownload(purchaseId: string): void {
    this.isProcessing.set(true);
    this._purchaseService.downloadPurchase(purchaseId).subscribe({
      next: (blob) => {
        this.isProcessing.set(false);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'asset.zip';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.actionError.set(err.error?.message ?? 'Download failed');
      },
    });
  }

  goBack(): void {
    this._router.navigate(['/assets']);
  }
}