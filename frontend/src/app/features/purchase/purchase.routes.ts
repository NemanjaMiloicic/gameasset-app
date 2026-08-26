import { Routes } from '@angular/router';
import { PurchaseSuccess } from './components/purchase-success/purchase-success';
import { PurchaseCancelled } from './components/purchase-cancelled/purchase-cancelled';
import { MyPurchases } from './components/my-purchases/my-purchases';
import { authGuard } from '../../shared/guards/auth.guard';

export const purchaseRoutes: Routes = [
  { path: 'success', component: PurchaseSuccess },
  { path: 'cancelled', component: PurchaseCancelled},
  { path: 'my', component: MyPurchases, canActivate: [authGuard]},
];