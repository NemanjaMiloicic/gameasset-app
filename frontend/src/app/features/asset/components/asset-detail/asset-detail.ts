import { Component, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { selectAssetById } from '../../store/asset.selectors';
import * as AssetActions from '../../store/asset.actions';

@Component({
  selector: 'app-asset-detail',
  imports: [],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetail {
  private readonly _route = inject(ActivatedRoute);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);

  private readonly _id = toSignal(
    this._route.paramMap.pipe(switchMap((params) => Promise.resolve(params.get('id')!)))
  );

  constructor() {
    effect(() => {
      const id = this._route.snapshot.paramMap.get('id');
      if (id && !this.asset()) {
        this._store.dispatch(AssetActions.loadAssetById({ id }));
      }
    });
  }

  asset = toSignal(
    this._route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id')!;
        return this._store.select(selectAssetById(id));
      })
    )
  );


  goBack(): void {
    this._router.navigate(['/assets']);
  }
}