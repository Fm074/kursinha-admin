import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ProductManagementService {
  constructor(private _httpClient: HttpClient) {}

  // Get product analytics
  getProductAnalytics(productId: string): Observable<any> {
    return this._httpClient.get(
      `${environment.serverUrl}/api/admin/products/${productId}/analytics`
    );
  }

  // Pause a product
  pauseProduct(productId: string, reason: string): Observable<any> {
    return this._httpClient.post(
      `${environment.serverUrl}/api/admin/products/${productId}/pause`,
      {
        reason,
      }
    );
  }

  // Reject a product
  rejectProduct(productId: string, reason: string): Observable<any> {
    return this._httpClient.post(
      `${environment.serverUrl}/api/admin/products/${productId}/reject`,
      {
        reason,
      }
    );
  }

  // Approve a product
  approveProduct(productId: string): Observable<any> {
    return this._httpClient.post(
      `${environment.serverUrl}/api/admin/products/${productId}/approve`,
      {}
    );
  }

  // Get pending approval products
  getPendingProducts(page: number, limit: number): Observable<any> {
    return this._httpClient.get(
      `${environment.serverUrl}/api/admin/products/pending-approval?page=${page}&limit=${limit}`
    );
  }

  getAllProducts(
    filters: {
      page: number;
      limit: number;
      search: string;
      category: string;
      status: string;
    }
  ) {
    let queryParams = `page=${filters.page}&limit=${filters.limit}`;

    if (filters.search) {
      queryParams += `&search=${filters.search}`;
    }

    if (filters.status) {
      queryParams += `&status=${filters.status}`;
    }

    if (filters.category) {
      queryParams += `&category=${filters.category}`;
    }

    return this._httpClient.get(
      `${environment.serverUrl}/api/admin/products?${queryParams}`
    );
  }
}
