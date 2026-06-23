import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

export interface WebhookPayload {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive?: boolean;
  headers?: Record<string, string>;
  retryCount?: number;
  timeout?: number;
}

@Injectable({
  providedIn: 'root',
})
export class WebhooksService {
  private base = `${environment.serverUrl}/api/settings/webhooks`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get(this.base);
  }

  create(payload: WebhookPayload) {
    return this.http.post(this.base, payload);
  }

  update(id: string, payload: Partial<WebhookPayload>) {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  logs(id: string) {
    return this.http.get(`${this.base}/${id}/logs`);
  }

  logsAll() {
    return this.http.get(`${this.base}/logs`);
  }
}
