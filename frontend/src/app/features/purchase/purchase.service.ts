import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../shared/interfaces/paginated-response.interface';
import { Purchase } from './interfaces/purchase.interface';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  checkOwnership(assetId: string): Observable<{ owned: boolean, purchaseId: string | null }> {
    return this._http.get<{ owned: boolean, purchaseId: string | null }>(`${this._apiUrl}/purchases/check/${assetId}`);
  }

  getMyPurchases(skip: number, limit: number): Observable<PaginatedResponse<Purchase>> {
    return this._http.get<PaginatedResponse<Purchase>>(`${this._apiUrl}/purchases/my`, {
      params: { skip, limit },
    });
  }

  buyFree(assetId: string): Observable<Purchase> {
    return this._http.post<Purchase>(`${this._apiUrl}/purchases/free/${assetId}`, {});
  }

  initiatePaidPurchase(assetId: string): Observable<{ checkoutUrl: string }> {
    return this._http.post<{ checkoutUrl: string }>(`${this._apiUrl}/purchases/paid/${assetId}`, {});
  }

  downloadPurchase(purchaseId: string): Observable<Blob> {
    return this._http.get(`${this._apiUrl}/purchases/${purchaseId}/download`, {
        responseType: 'blob',
    });
  }
}