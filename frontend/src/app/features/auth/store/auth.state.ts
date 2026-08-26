export interface AuthState {
  user: { id: string; email: string; username: string; userRole: string } | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isInitializing: true,
  error: null,
};