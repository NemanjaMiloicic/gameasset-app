import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RegisterPayload } from './interfaces/register-payload.interface';
import { Observable } from 'rxjs';
import { LoginPayload } from './interfaces/login-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  register(payload: RegisterPayload): Observable<{message:string}> {
    return this._http.post<{message:string}>(`${this._apiUrl}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(`${this._apiUrl}/auth/login`, payload);
  }

  verifyEmail(token: string): Observable<{message: string}> {
    return this._http.get<{message: string}>(`${this._apiUrl}/auth/verify`, {
      params: {token},
    });
  }
}
