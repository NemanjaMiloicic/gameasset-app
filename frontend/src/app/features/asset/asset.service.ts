import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Asset } from './interfaces/asset.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginated-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  getAll(skip: number, limit: number): Observable<PaginatedResponse<Asset>> {
    return this._http.get<PaginatedResponse<Asset>>(`${this._apiUrl}/assets`, {
      params: { skip, limit },
    });
  }

  getById(id: string): Observable<Asset> {
    return this._http.get<Asset>(`${this._apiUrl}/assets/${id}`);
  }
}