import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

export interface DashboardOverview {
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  activatedUsers: number;
  pendingProducts: number;
  canceledSales: number;
  pendingSales: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    overview: DashboardOverview;
    monthlyRevenue: any[]; // pode tipar depois com { month: string; value: number }
    growthMetrics: Record<string, any>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardManagementService {
  constructor(private _httpClient: HttpClient) {}

  /**
   * Busca os dados do dashboard
   * @param timeframe (ex: 'today', 'week', 'month', 'year', 'personalized', 'all')
   * @param start Data de início (opcional, usado com 'personalized')
   * @param end Data de fim (opcional, usado com 'personalized')
   */
  getDashboard(
    timeframe: 'today' | 'week' | 'month' | 'year' | 'personalized' | 'all' = 'month',
    start?: string,
    end?: string
  ): Observable<DashboardResponse> {
    let params: any = {};
    if (timeframe !== 'all') params.timeframe = timeframe;
    if (start) params.start = start;
    if (end) params.end = end;

    return this._httpClient.get<DashboardResponse>(
      `${environment.serverUrl}/api/admin/dashboard/real`,
      { params }
    );
  }

  getKpis(
    timeframe: 'today' | 'week' | 'month' | 'year' | 'personalized' | 'all' = 'month',
    start?: string,
    end?: string
  ): Observable<any> {
    let params: any = {};
    if (timeframe !== 'all') params.timeframe = timeframe;
    if (start) params.start = start;
    if (end) params.end = end;

    return this._httpClient.get<any>(
      `${environment.serverUrl}/api/admin/analytics/kpis`,
      { params }
    );
  }


}
