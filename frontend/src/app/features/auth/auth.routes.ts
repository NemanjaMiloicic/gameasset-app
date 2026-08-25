import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { VerifyEmail } from './components/verify-email/verify-email';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';

export const authRoutes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'verify', component: VerifyEmail },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
];