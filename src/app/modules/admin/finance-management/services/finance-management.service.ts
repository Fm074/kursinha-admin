import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

export interface FeesConfig {
  serviceFeePercentage: number; // % de serviço (venda)
  withdrawalFeePercentage: number; // % por saque
  fixedWithdrawalFee: number; // taxa fixa por saque
  minimumWithdrawalAmount: number; // mínimo para sacar
  platformFeeCheckout: number; // taxa aplicada no checkout (se houver)
}

@Injectable({
  providedIn: 'root',
})
export class FinanceManagementService {
  constructor(private http: HttpClient) {}

  getFeeSettings(): Observable<any> {
    return this.http.get(`${environment.serverUrl}/api/finance/fee-settings`);
  }

  updateFeeSettings(settings: any): Observable<any> {
    return this.http.put(
      `${environment.serverUrl}/api/finance/fee-settings`,
      settings
    );
  }

  exportReport(filters: any, format: 'csv' | 'excel'): Observable<any> {
    const params = {
      ...filters,
      format,
    };
    return this.http.get(`${environment.serverUrl}/api/finance/export`, {
      params,
      responseType: 'blob',
    });
  }

  getFinancialData(params: {
    period: string;
    transaction_type: string;
    start_date?: string;
    end_date?: string;
  }): Observable<any> {
    let httpParams = new HttpParams()
      .set('period', params.period)
      .set('transaction_type', params.transaction_type);

    if (params.start_date) {
      httpParams = httpParams.set('start_date', params.start_date);
    }
    if (params.end_date) {
      httpParams = httpParams.set('end_date', params.end_date);
    }

    return this.http.get(
      `${environment.serverUrl}/api/admin/charts/financial`,
      { params: httpParams }
    );
  }

  /** GET: busca apenas o bloco de fees do config */
  getPlatformFees(): Observable<FeesConfig> {
    return this.http
      .get<any>(`${environment.serverUrl}/api/admin/config/platform`)
      .pipe(map((res) => (res?.data?.platformConfig?.fees) as FeesConfig));
  }

  /** POST: atualiza somente o bloco de fees (payload parcial) */
  updatePlatformFees(fees: FeesConfig): Observable<FeesConfig> {
    return this.http
      .post<any>(`${environment.serverUrl}/api/admin/config/platform`, { fees })
      .pipe(map((res) => (res?.data?.platformConfig?.fees) as FeesConfig));
  }
}
