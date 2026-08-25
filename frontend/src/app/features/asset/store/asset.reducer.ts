import { createReducer, on } from '@ngrx/store';
import * as AssetActions from './asset.actions';
import { assetAdapter, AssetState, initialAssetState } from './asset.state';

export const assetReducer = createReducer(
  initialAssetState,

  on(AssetActions.loadAssets, (state): AssetState => ({
    ...state,
    isLoading: true,
    error: null,

  })),

  on(AssetActions.loadAssetsSuccess, (state, { assets, total }): AssetState =>
    assetAdapter.setAll(assets, {
      ...state,
      isLoading: false,
      total,

  })),

  on(AssetActions.loadAssetsFailure, (state, { error }): AssetState => ({
    ...state,
    isLoading: false,
    error,

  })),

  on(AssetActions.loadAssetByIdSuccess, (state, { asset }): AssetState =>
    assetAdapter.upsertOne(asset, state)
  ),
);