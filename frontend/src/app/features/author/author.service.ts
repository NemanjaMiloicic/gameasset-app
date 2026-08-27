import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicAuthorProfile } from './interfaces/public-author-profile.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  getPublicProfile(id: string): Observable<PublicAuthorProfile> {
    return this._http.get<PublicAuthorProfile>(`${this._apiUrl}/users/${id}`);
  }

  connectStripe(): Observable<{ onboardingUrl: string }> {
    return this._http.post<{ onboardingUrl: string }>(`${this._apiUrl}/users/stripe/connect`, {});
  }

  checkOnboardingComplete(): Observable<{ onboardingComplete: boolean }> {
    return this._http.get<{ onboardingComplete: boolean }>(`${this._apiUrl}/users/stripe/onboarding-complete`);
  }
}