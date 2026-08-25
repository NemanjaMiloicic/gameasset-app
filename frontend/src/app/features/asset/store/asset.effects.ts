import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AssetService } from '../asset.service';
import * as AssetActions from './asset.actions';

@Injectable()
export class AssetEffects {
  private readonly _actions$ = inject(Actions);
  private readonly _assetsService = inject(AssetService);

  loadAssets$ = createEffect(() =>
    this._actions$.pipe(
      ofType(AssetActions.loadAssets),
      switchMap(({ skip, limit }) =>
        this._assetsService.getAll(skip, limit).pipe(
          map((response) =>
            AssetActions.loadAssetsSuccess({
              assets: response.data,
              total: response.total,
            })
          ),
          catchError((err) =>
            of(AssetActions.loadAssetsFailure({
              error: err.error?.message ?? 'Failed to load assets',
            }))
          )
        )
      )
    )
  );

  loadAssetById$ = createEffect(() =>
    this._actions$.pipe(
      ofType(AssetActions.loadAssetById),
      switchMap(({ id }) =>
        this._assetsService.getById(id).pipe(
          map((asset) => AssetActions.loadAssetByIdSuccess({ asset })),
          catchError((err) =>
            of(AssetActions.loadAssetByIdFailure({
              error: err.error?.message ?? 'Asset not found',
            }))
          )
        )
      )
    )
  );
}