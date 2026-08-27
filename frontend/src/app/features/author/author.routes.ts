import { Routes } from '@angular/router';
import { AuthorProfile } from './components/author-profile/author-profile';
import { AuthorDashboard } from './components/author-dashboard/author-dashboard';
import { authGuard } from '../../shared/guards/auth.guard';
import { MyAssets } from './components/my-assets/my-assets';
import { UploadAsset } from './components/upload-asset/upload-asset';
import { StripeOnboardingCallback } from './components/stripe-onboarding-callback/stripe-onboarding-callback';
import { EditProfile } from './components/edit-profile/edit-profile';

export const authorRoutes: Routes = [
  { path: 'dashboard', component: AuthorDashboard, canActivate: [authGuard] },
  { path: 'assets', component: MyAssets, canActivate: [authGuard] },
  { path: 'profile/edit', component: EditProfile, canActivate: [authGuard] },
  { path: ':id', component: AuthorProfile },
  { path: 'assets/new', component: UploadAsset, canActivate: [authGuard] },
  { path: 'stripe/callback' , component: StripeOnboardingCallback, canActivate: [authGuard]},
];