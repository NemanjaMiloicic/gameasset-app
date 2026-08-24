import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RegisterPayload } from './interfaces/register-payload.interface';
import { Observable } from 'rxjs';
import { LoginPayload } from './interfaces/login-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { AuthUser } from './interfaces/auth-user.interface';
import { ForgotPasswordPayload } from './interfaces/forgot-password.interface';
import { ResetPasswordPayload } from './interfaces/reset-password.interface';

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

  getProfile(): Observable<AuthUser> {
    return this._http.get<AuthUser>(`${this._apiUrl}/auth/profile`);
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<{ message: string }> {
    return this._http.post<{ message: string }>(`${this._apiUrl}/auth/forgotPassword`, payload);
  }

  validatePasswordToken(token: string, email: string): Observable<boolean> {
      return this._http.get<boolean>(`${this._apiUrl}/auth/validPasswordToken`, {
          params: { token, email },
      });
  }

  resetPassword(payload: ResetPasswordPayload): Observable<{ message: string }> {
      return this._http.put<{ message: string }>(`${this._apiUrl}/auth/resetPassword`, payload);
  }
}
