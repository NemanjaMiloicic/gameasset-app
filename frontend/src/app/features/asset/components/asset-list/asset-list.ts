import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { merge, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import * as AssetActions from '../../store/asset.actions';
import { AssetCard } from '../asset-card/asset-card';
import { selectAllAssets, selectAssetsLoading, selectAssetsTotal } from '../../store/asset.selectors';

@Component({
  selector: 'app-asset-list',
  imports: [AssetCard, ReactiveFormsModule],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.css',
})
export class AssetList implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _destroy$ = new Subject<void>();

  assets = this._store.selectSignal(selectAllAssets);
  isLoading = this._store.selectSignal(selectAssetsLoading);
  total = this._store.selectSignal(selectAssetsTotal);

  readonly limit = 12;
  currentPage = signal(0);

  totalPages = computed(() => Math.ceil(this.total() / this.limit));

  filterForm = this._formBuilder.group({
    search: [''],
    assetType: [''],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
    isFree: [false],
    tags: [''],
  });

  ngOnInit(): void {
    const search$ = this.filterForm.controls.search.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    );

    const tags$ = this.filterForm.controls.tags.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    );

    const price$ = merge(
      this.filterForm.controls.minPrice.valueChanges,
      this.filterForm.controls.maxPrice.valueChanges
    ).pipe(debounceTime(400));

    const instant$ = merge(
      this.filterForm.controls.assetType.valueChanges,
      this.filterForm.controls.isFree.valueChanges
    );

    merge(search$, tags$, price$, instant$)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.currentPage.set(0);
        this._loadAssets();
      });

    this._loadAssets();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadAssets(): void {
    const value = this.filterForm.value;

    this._store.dispatch(AssetActions.loadAssets({
      filters: {
        skip: this.currentPage() * this.limit,
        limit: this.limit,
        search: value.search || undefined,
        assetType: value.assetType || undefined,
        minPrice: value.minPrice ?? undefined,
        maxPrice: value.maxPrice ?? undefined,
        isFree: value.isFree || undefined,
        tags: value.tags || undefined,
      },
    }));
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this._loadAssets();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      search: '',
      assetType: '',
      minPrice: null,
      maxPrice: null,
      isFree: false,
      tags: '',
    });
  }

  onAssetClick(assetId: string): void {
    this._router.navigate(['/assets', assetId]);
  }
}