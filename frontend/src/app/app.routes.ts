import { Routes } from '@angular/router';
import { Home } from './features/home/home';

export const routes: Routes = [
    { path: '', component: Home},
    
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    },

    {
        path: 'assets',
        loadChildren: () => import('./features/asset/asset.routes').then(m => m.assetRoutes),
    },

    {
        path: 'purchase',
        loadChildren: () => import('./features/purchase/purchase.routes').then(m => m.purchaseRoutes),
    },

    {
        path: 'author',
        loadChildren: () => import('./features/author/author.routes').then(m => m.authorRoutes),
    },

];
