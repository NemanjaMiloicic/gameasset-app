import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state): AuthState => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, AuthActions.sessionRestored, (state, { user, token }): AuthState => ({
    ...state,
    user,
    token,
    isLoading: false,
    isInitializing: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }): AuthState => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.logout, (): AuthState => ({
    ...initialAuthState,
    isInitializing: false,
  })),
);