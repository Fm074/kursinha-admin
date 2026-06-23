import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

export interface UtmfyPayload {
  apiKey: string;
  workspace: string;
  isActive: boolean;
  utmSettings: {
    trackPageViews: boolean;
    trackEvents: boolean;
    autoDetectUTM: boolean;
    customEvents?: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class UtmfyService {
  private base = `${environment.serverUrl}/api/settings/utmfy`;

  constructor(private http: HttpClient) {}

  getSettings() {
    return this.http.get(this.base);
  }

  createSettings(payload: UtmfyPayload) {
    return this.http.post(this.base, payload);
  }

  updateSettings(payload: UtmfyPayload) {
    return this.http.put(this.base, payload);
  }

  deleteSettings() {
    return this.http.delete(this.base);
  }
}
