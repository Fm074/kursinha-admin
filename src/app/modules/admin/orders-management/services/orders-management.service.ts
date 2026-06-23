import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class OrdersManagementService {
  constructor(private _http: HttpClient) {}

  getAllOrders(params?: any): Observable<any> {
    return this._http.get<any>(`${environment.serverUrl}/api/admin/orders`, {
      params,
    });
  }

  getOrdersReport(startDate: string, endDate: string): Observable<any> {
    return this._http.get<any>(
      `${environment.serverUrl}/api/sales/report?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getOrdersPerformance(
    period: string,
    type: string,
    start_date?: string,
    end_date?: string
  ): Observable<any> {
    let url = `${environment.serverUrl}/api/admin/charts/sales?period=${period}&type=${type}`;
    if (period === 'custom' && start_date && end_date) {
      url += `&start_date=${start_date}&end_date=${end_date}`;
    }
    return this._http.get<any>(url);
  }

  cancelSale(orderId: string): Observable<any> {
    return this._http.post<any>(
      `${environment.serverUrl}/api/sales/cancel-by-order/${orderId}`,
      {}
    );
  }
}
