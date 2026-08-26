import { createAction, props } from '@ngrx/store';
import { AuthUser } from '../interfaces/auth-user.interface';

export const login = createAction(
    '[Auth] Login',
    props<{email: string, password: string}>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthUser; token: string }>()
);

export const sessionRestored = createAction(
  '[Auth] Session Restored',
  props<{ user: AuthUser; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
export const sessionCleared = createAction('[Auth] Session Cleared');
