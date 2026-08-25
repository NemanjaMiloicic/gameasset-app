import { createAction, props } from '@ngrx/store';
import { Asset } from '../interfaces/asset.interface';

export const loadAssets = createAction(
  '[Asset] Load Assets',
  props<{ skip: number; limit: number }>()
);

export const loadAssetsSuccess = createAction(
  '[Asset] Load Assets Success',
  props<{ assets: Asset[]; total: number }>()
);

export const loadAssetsFailure = createAction(
  '[Asset] Load Assets Failure',
  props<{ error: string }>()
);

export const loadAssetById = createAction(
  '[Asset] Load Asset By Id',
  props<{ id: string }>()
);

export const loadAssetByIdSuccess = createAction(
  '[Asset] Load Asset By Id Success',
  props<{ asset: Asset }>()
);

export const loadAssetByIdFailure = createAction(
  '[Asset] Load Asset By Id Failure',
  props<{ error: string }>()
);