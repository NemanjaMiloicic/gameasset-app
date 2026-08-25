import { Routes } from '@angular/router';
import { PurchaseSuccess } from './components/purchase-success/purchase-success';
import { PurchaseCancelled } from './components/purchase-cancelled/purchase-cancelled';

export const purchaseRoutes: Routes = [
  { path: 'success', component: PurchaseSuccess },
  { path: 'cancelled', component: PurchaseCancelled},
];