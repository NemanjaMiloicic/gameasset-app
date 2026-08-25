import { Routes } from "@angular/router";
import { AssetList } from "./components/asset-list/asset-list";
import { AssetDetail } from "./components/asset-detail/asset-detail";

export const assetRoutes: Routes = [
    { path: '', component: AssetList },
    { path: ':id', component: AssetDetail },
];