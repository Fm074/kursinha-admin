import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class WithdrawalService {
  constructor(private http: HttpClient) {}

  getWithdrawals(page: number, limit: number): Observable<any> {
    return this.http.get(
      `${environment.serverUrl}/api/withdrawals?page=${page}&limit=${limit}`
    );
  }

  approveWithdrawal(id: string): Observable<any> {
    return this.http.post(
      `${environment.serverUrl}/api/admin/financial/withdrawals/${id}/approve`,
      {}
    );
  }

  rejectWithdrawal(id: string, reason: string): Observable<any> {
    return this.http.post(
      `${environment.serverUrl}/api/admin/financial/withdrawals/${id}/reject`,
      { reason }
    );
  }
}
