import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Register } from './features/auth/components/register/register';
import { Login } from './features/auth/components/login/login';
import { VerifyEmail } from './features/auth/components/verify-email/verify-email';
import { ForgotPassword } from './features/auth/components/forgot-password/forgot-password';

export const routes: Routes = [
    { path: '', component: Home},
    { path: 'auth/register', component: Register },
    { path: 'auth/login', component: Login },
    { path: 'auth/verify', component: VerifyEmail },
    { path: 'auth/forgot-password', component: ForgotPassword}
    
];
