import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Asset } from './interfaces/asset.interface';
import { PaginatedResponse } from '../../shared/interfaces/paginated-response.interface';
import { CreateAssetPayload } from './interfaces/create-asset-payload.interface';

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

  getMy(skip: number, limit: number): Observable<PaginatedResponse<Asset>> {
    return this._http.get<PaginatedResponse<Asset>>(`${this._apiUrl}/assets/my`, {
        params: { skip, limit },
    });
  }

  create(payload: CreateAssetPayload): Observable<Asset> {
    return this._http.post<Asset>(`${this._apiUrl}/assets`, payload);
  }

  uploadPreviewImage(assetId: string, file: File): Observable<Asset> {
      const formData = new FormData();
      formData.append('preview', file, file.name);
      return this._http.put<Asset>(`${this._apiUrl}/assets/${assetId}/preview`, formData);
  }

  uploadFiles(assetId: string, files: File[]): Observable<Asset> {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });
      return this._http.post<Asset>(`${this._apiUrl}/assets/${assetId}/files`, formData);
  }
}