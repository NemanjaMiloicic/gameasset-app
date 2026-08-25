import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly _actions$ = inject(Actions);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  login$ = createEffect(() =>
    this._actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this._authService.login({ email, password }).pipe(
          map((response) =>
            AuthActions.loginSuccess({
              user: response.user,
              token: response.accessToken,
            })
          ),
          catchError((err) =>
            of(AuthActions.loginFailure({
              error: err.error?.message ?? 'Login failed',
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ token }) => {
          localStorage.setItem('accessToken', token);
          this._router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
  () =>
    this._actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('accessToken');
          this._router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  init$ = createEffect(() =>
    this._actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      switchMap(() => {
        const token = localStorage.getItem('accessToken');

        if (!token)
          return of(AuthActions.sessionCleared());

        return this._authService.getProfile().pipe(
          map((user) => AuthActions.sessionRestored({ user, token })),
          catchError(() => {
            localStorage.removeItem('accessToken');
            return of(AuthActions.sessionCleared());
          })
        );
      })
    )
  );

}