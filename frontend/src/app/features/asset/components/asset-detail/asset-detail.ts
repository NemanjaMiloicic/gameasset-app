import { Component, inject, effect, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap, startWith, Subject, Observable } from 'rxjs';
import { selectAssetById } from '../../store/asset.selectors';
import * as AssetActions from '../../store/asset.actions';
import { PurchaseService } from '../../../purchase/purchase.service';
import { ReviewService } from '../../../review/review.service';
import { selectIsAuthenticated } from '../../../auth/store/auth.selectors';
import { Review } from '../../../review/interfaces/review.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asset-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetail {
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);
  private readonly _purchaseService = inject(PurchaseService);
  private readonly _reviewService = inject(ReviewService);

  private readonly _isAuthenticated = this._store.selectSignal(selectIsAuthenticated);
  private readonly _refresh$ = new Subject<void>();

  isProcessing = signal(false);
  actionError = signal('');

  reviewRating = signal(5);
  reviewComment = signal('');
  isSubmittingReview = signal(false);
  reviewError = signal('');

  constructor() {
    effect(() => {
      const id = this._route.snapshot.paramMap.get('id');
      const current = this.pageData();
      if (id && (!current || !current[0])) {
        this._store.dispatch(AssetActions.loadAssetById({ id }));
      }
    });
  }

  pageData = toSignal(
    combineLatest([
      this._route.paramMap,
      this._refresh$.pipe(startWith(undefined)),
    ]).pipe(
      switchMap(([params]) => {
        const id = params.get('id')!;
        const asset$ = this._store.select(selectAssetById(id));

        const owned$ = this._isAuthenticated()
          ? this._purchaseService.checkOwnership(id)
          : of({ owned: false, purchaseId: null });

        const myReview$: Observable<Review | null> = this._isAuthenticated()
          ? this._reviewService.findMyReview(id)
          : of(null);

        const reviews$ = this._reviewService.findByAsset(id);
        const rating$ = this._reviewService.getAverageRating(id);

        return combineLatest([asset$, owned$, myReview$, reviews$, rating$]);
      })
    )
  );

  onSubmitReview(assetId: string): void {
    if (!this._isAuthenticated()) {
      this._router.navigate(['/auth/login']);
      return;
    }

    this.isSubmittingReview.set(true);
    this.reviewError.set('');

    this._reviewService.create(assetId, this.reviewRating(), this.reviewComment() || undefined).subscribe({
      next: () => {
        this.isSubmittingReview.set(false);
        this.reviewComment.set('');
        this.reviewRating.set(5);
        this._refresh$.next();
      },
      error: (err) => {
        this.isSubmittingReview.set(false);
        this.reviewError.set(err.error?.message ?? 'Failed to submit review');
      },
    });
  }

  onDeleteReview(reviewId: string): void {
    this._reviewService.remove(reviewId).subscribe({
      next: () => this._refresh$.next(),
    });
  }

  onBuyFree(assetId: string): void {
    if (!this._isAuthenticated()) {
      this._router.navigate(['/auth/login']);
      return;
    }

    this.isProcessing.set(true);
    this._purchaseService.buyFree(assetId).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this._refresh$.next();
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