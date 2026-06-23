import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../../interfaces/users';
import { environment } from '../../../environments/environments';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _httpClient: HttpClient, private router: Router) {}

  signUp(user: User) {
    return this._httpClient.post(`${environment.serverUrl}/api/clients`, user, {
      observe: 'response',
      withCredentials: true,
    });
  }

  signIn(user: { email: string; password: string }) {
    return this._httpClient.post(
      `${environment.serverUrl}/api/clients/login`,
      {
        email: user.email,
        password: user.password,
      },
      {
        observe: 'response',
        withCredentials: true,
      }
    );
  }

  signOut() {
    return this._httpClient.post(
      `${environment.serverUrl}/api/clients/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  }

  /** Retorna os dados do usuário logado */
  me(): Observable<any | null> {
    return this._httpClient
      .get<{ data: any }>(`${environment.serverUrl}/api/clients/me`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) => {
          console.error('Erro ao obter usuário:', err);
          return of(null);
        })
      );
  }

  /** Apenas boolean indicando se está autenticado */
  isAuthenticated(): Observable<boolean> {
    return this.me().pipe(map((user) => !!user));
  }

  verifyOTP(otpId: string, otp: string): Observable<{ token: string }> {
    const formData = new FormData();
    formData.append('otpId', otpId);
    formData.append('otp', otp);

    return this._httpClient
      .post<{ token: string }>(
        `${environment.serverUrl}/api/clients/verify-otp`,
        {
          otpId: otpId,
          otp: otp,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => res));
  }

  passwordResetRequest(email: string) {
    return this._httpClient.post(
      `${environment.serverUrl}/api/clients/password-reset-request`,
      { email: email }
    );
  }

  passwordResetConfirm(payload: { token: string; newPassword: string }) {
    return this._httpClient.post(
      `${environment.serverUrl}/api/clients/password-reset-confirm`,
      payload
    );
  }
}
