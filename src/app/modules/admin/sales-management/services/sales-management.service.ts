import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SalesReport,
  RefundRequest,
  FraudAlert,
  FraudAlertStatusUpdate,
} from '../interfaces/sales.interface';
import { ChartType } from '../sales-management.component';
import { environment } from '../../../../environments/environments';

export type periodSalesPerformance = '30d' | '7d' | '24h' | 'custom';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  constructor(private http: HttpClient) {}

  getSalesReportByRange(
    startDate: Date | string,
    endDate: Date | string
  ): Observable<{ status: string; data: SalesReport }> {
    const start = typeof startDate === 'string' ? startDate : startDate.toISOString();
    const end = typeof endDate === 'string' ? endDate : endDate.toISOString();
    return this.http.get<{ status: string; data: SalesReport }>(
      `${environment.serverUrl}/api/sales/report?startDate=${start}&endDate=${end}`
    );
  }

  createRefund(saleId: string, data: RefundRequest): Observable<any> {
    return this.http.post(`${environment.serverUrl}/api/sales/${saleId}/refund`, data);
  }

  processRefund(refundId: string): Observable<any> {
    return this.http.post(`${environment.serverUrl}/api/sales/refunds/${refundId}/process`, {});
  }

  createFraudAlert(saleId: string, data: FraudAlert): Observable<any> {
    return this.http.post(`${environment.serverUrl}/api/sales/${saleId}/fraud-alert`, data);
  }

  updateFraudAlertStatus(
    alertId: string,
    data: FraudAlertStatusUpdate
  ): Observable<any> {
    return this.http.post(`${environment.serverUrl}/api/sales/fraud-alerts/${alertId}/status`, data);
  }

  getSalesPerformance(
    period: periodSalesPerformance,
    type: ChartType,
    start_date?: string | Date,
    end_date?: string | Date
  ) {
    let url = `${environment.serverUrl}/api/admin/charts/sales?period=${period}&type=${type}`;
    if (period === 'custom' && start_date && end_date) {
      const start =
        typeof start_date === 'string' ? start_date : start_date.toISOString();
      const end =
        typeof end_date === 'string' ? end_date : end_date.toISOString();
      url += `&start_date=${start}&end_date=${end}`;
    }
    return this.http.get(url);
  }

  getSalesList(params: any): Observable<any> {
    return this.http.get(`${environment.serverUrl}/api/admin/sales`, { params });
  }
}
