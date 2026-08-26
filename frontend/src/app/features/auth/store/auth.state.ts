import { AuthUser } from "../interfaces/auth-user.interface";

export interface AuthState {
  user: AuthUser | null;
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