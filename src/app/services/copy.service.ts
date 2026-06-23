// copy.service.ts
import { Injectable } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class CopyService {
  constructor(private clipboard: ClipboardService) {}

  /**
   * Copia texto para a área de transferência com feedback via SweetAlert2.
   * Funciona em desktop e mobile (Android/iOS). bn
   */
  copyToClipboard(
    text: string,
    successMessage: string = 'Copiado!'
  ): void {
    try {
      const copied = this.clipboard.copyFromContent(text);

      if (copied) {
        this.showSuccess(successMessage);
      } else {
        this.showError();
      }
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      this.showError();
    }
  }

  /** Exibe alerta de sucesso */
  private showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: message,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }

  /** Exibe alerta de erro */
  private showError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível copiar o texto.',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }
}
