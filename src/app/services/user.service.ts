import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environments';
export type userRole =
  | 'COPRODUCER'
  | 'PRODUCER'
  | 'AFFILIATE'
  | 'BUYER'
  | 'ADMIN';

@Injectable({
  providedIn: 'root',
})
export class userService {
  constructor(private _httpClient: HttpClient) {}

  updateUserRole(userId: string, role: userRole) {
    return this._httpClient.put(
      `${environment.serverUrl}/api/clients/${userId}`,
      {
        role,
      }
    );
  }

  getComplianceStatus(){
    return this._httpClient.get(`${environment.serverUrl}/api/me/compliance`);
  }

  submitKycDocuments(payload: any) {
    return this._httpClient.post(
      `${environment.serverUrl}/api/kyc/submit`,
      payload
    );
  }

  updateUser(userId: string, User: any) {}
}
