import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Asset } from '../interfaces/asset.interface';

export interface AssetState extends EntityState<Asset> {
  isLoading: boolean;
  error: string | null;
  total: number;
}

export const assetAdapter = createEntityAdapter<Asset>();

export const initialAssetState: AssetState = assetAdapter.getInitialState({
  isLoading: false,
  error: null,
  total: 0,
});