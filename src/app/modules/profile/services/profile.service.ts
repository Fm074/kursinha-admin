import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Upload da foto de perfil
   * @param file Arquivo de imagem a ser enviado
   * @returns Observable com a resposta da API
   */
  uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);

    return this.httpClient.post(
      `${environment.serverUrl}/api/clients/upload-photo`,
      formData
    );
  }

  /**
   * Remove a foto de perfil do usuário
   * @returns Observable com a resposta da API
   */
  removeProfilePhoto() {
    return this.httpClient.delete(
      `${environment.serverUrl}/api/clients/remove-photo`
    );
  }

  /**
   * Obtém a URL da foto de perfil atual
   * @returns Observable com a URL da foto
   */
  getProfilePhoto() {
    return this.httpClient.get(`${environment.serverUrl}/api/clients/photo`);
  }

  updateProfile(clientId: string, data: any) {
    return this.httpClient.put(
      `${environment.serverUrl}/api/clients/${clientId}`,
      data
    );
  }
}
