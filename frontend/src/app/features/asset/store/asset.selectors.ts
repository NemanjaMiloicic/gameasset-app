import { createFeatureSelector, createSelector } from '@ngrx/store';
import { assetAdapter, AssetState } from './asset.state';

export const selectAssetState = createFeatureSelector<AssetState>('asset');

const { selectAll, selectEntities, selectIds, selectTotal } =
  assetAdapter.getSelectors(selectAssetState);

export const selectAllAssets = selectAll;
export const selectAssetEntities = selectEntities;
export const selectAssetIds = selectIds;
export const selectAssetCount = selectTotal;

export const selectAssetsLoading = createSelector(
  selectAssetState,
  (state) => state.isLoading
);

export const selectAssetsError = createSelector(
  selectAssetState,
  (state) => state.error
);

export const selectAssetsTotal = createSelector(
  selectAssetState,
  (state) => state.total
);

export const selectAssetById = (id: string) =>
  createSelector(selectAssetEntities, (entities) => entities[id]);