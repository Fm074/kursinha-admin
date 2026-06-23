import { Injectable } from '@angular/core';
import { User } from '../../../../interfaces/users';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  users: User[] = [
    // {
    //   id: 2,
    //   name: 'Ana Santos',
    //   email: 'ana@empresa.com',
    //   role: 'CLIENT',
    //   status: 'PENDING',
    //   documents: ['https://placehold.co/192', 'https://placehold.co/192']
    // }
  ];

  constructor(private _httpClient: HttpClient) {}

  getAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    role?: string,
    search?: string
  ) {
    // Inicia com os parâmetros obrigatórios
    let queryParams = `page=${page}&limit=${limit}`;

    // Adiciona status apenas se fornecido
    if (status) {
      queryParams += `&status=${status}`;
    }

    // Adiciona role apenas se fornecido
    if (role) {
      queryParams += `&role=${role}`;
    }

    // Adiciona search apenas se fornecido
    if (search) {
      queryParams += `&search=${encodeURIComponent(search)}`;
    }

    return this._httpClient.get<any[]>(`${environment.serverUrl}/api/admin/users?${queryParams}`);
  }

  verifyDocuments(userId: string, data: any) {
    return this._httpClient.post(
      `${environment.serverUrl}/api/admin/users/${userId}/verify-documents`,
      {
        data: data,
      }
    );
  }

  updateUser(userId: string, data: any) {
    return this._httpClient.patch(`${environment.serverUrl}/api/admin/users/${userId}`, data);
  }

  suspendUser(userId: string) {
    return this._httpClient.post(`${environment.serverUrl}/api/clients/${userId}/suspend`, {
      reason: 'Violation of terms of service',
    });
  }

  reactivateUser(userId: string) {
    return this._httpClient.post(`${environment.serverUrl}/api/clients/${userId}/reactivate`, {});
  }

  getKycSubmissions(status: string, page: number, limit: number, search?: string) {
    let query = `kycStatus=${status}&page=${page}&limit=${limit}`;
    if (search) {
      query += `&search=${encodeURIComponent(search)}`;
    }
    return this._httpClient.get(`${environment.serverUrl}/api/compliance/profiles?${query}`);
  }

  getApprovedComplianceProfiles(page: number, limit: number) {
    return this._httpClient.get(
      `${environment.serverUrl}/api/compliance/profiles?kycStatus=APPROVED&payoutStatus=ENABLED&page=${page}&limit=${limit}`
    );
  }

  approveKyc(userId: string) {
    return this._httpClient.post(`${environment.serverUrl}/api/kyc/approve/${userId}`, {});
  }

  rejectKyc(userId: string) {
    return this._httpClient.post(`${environment.serverUrl}/api/kyc/reject/${userId}`, {});
  }

  impersonate(userId: string, email: string) {
    return this._httpClient.post<{ success: boolean; data: { token: string } }>(
      `${environment.serverUrl}/api/auth/admin/impersonate`,
      { userId, email }
    );
  }
}
