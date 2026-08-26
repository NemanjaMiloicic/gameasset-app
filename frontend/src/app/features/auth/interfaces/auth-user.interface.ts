export interface AuthUser {
  id: string;
  email: string;
  username: string;
  userRole: string;
  stripeOnboardingComplete: boolean;
}