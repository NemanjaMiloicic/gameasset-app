import { createAction, props } from '@ngrx/store';

export const login = createAction(
    '[Auth] Login',
    props<{email: string, password: string}>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: { id: string; email: string; username: string; userRole: string }; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
export const sessionCleared = createAction('[Auth] Session Cleared');