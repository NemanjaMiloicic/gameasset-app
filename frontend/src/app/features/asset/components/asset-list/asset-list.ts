import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import * as AssetActions from '../../store/asset.actions';
import { AssetCard } from '../asset-card/asset-card';
import { selectAllAssets, selectAssetsLoading } from '../../store/asset.selectors';

@Component({
  selector: 'app-asset-list',
  imports: [AssetCard],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.css',
})
export class AssetList implements OnInit {
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);

  assets = this._store.selectSignal(selectAllAssets);
  isLoading = this._store.selectSignal(selectAssetsLoading);

  ngOnInit(): void {
    this._store.dispatch(AssetActions.loadAssets({ skip: 0, limit: 12 }));
  }

  onAssetClick(assetId: string): void {
    this._router.navigate(['/assets', assetId]);
  }
}