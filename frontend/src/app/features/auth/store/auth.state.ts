export interface AuthState {
  user: { id: string; email: string; username: string; userRole: string } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};