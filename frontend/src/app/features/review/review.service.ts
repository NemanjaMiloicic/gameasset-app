import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from './interfaces/review.interface';
import { AverageRating } from './interfaces/average-rating.interface';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  create(assetId: string, rating: number, comment?: string): Observable<Review> {
    return this._http.post<Review>(`${this._apiUrl}/reviews`, { assetId, rating, comment });
  }

  findByAsset(assetId: string): Observable<Review[]> {
    return this._http.get<Review[]>(`${this._apiUrl}/assets/${assetId}/reviews`);
  }

  getAverageRating(assetId: string): Observable<AverageRating> {
    return this._http.get<AverageRating>(`${this._apiUrl}/assets/${assetId}/reviews/rating`);
  }

  findMyReview(assetId: string): Observable<Review | null> {
    return this._http.get<Review | null>(`${this._apiUrl}/reviews/mine/${assetId}`);
  }

  remove(reviewId: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/reviews/${reviewId}`);
  }
}