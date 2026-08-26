import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs';
import { selectIsAuthenticated, selectIsInitializing } from '../../features/auth/store/auth.selectors';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsInitializing).pipe(
    filter((isInitializing) => !isInitializing),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated)),
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      router.navigate(['/auth/login']);
      return false;
    })
  );
};