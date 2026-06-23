import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-sales-details-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sales-details-modal.component.html',
  styleUrl: './sales-details-modal.component.scss',
})
export class SalesDetailsModalComponent {
  @Input() isOpen = false;
  @Input() sale: any;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>(); // emite quando aprovar/reprovar

  constructor(private http: HttpClient) {}

  onClose() {
    this.close.emit();
  }

  approveSale() {
    Swal.fire({
      title: 'Aprovar pagamento?',
      text: 'Deseja aprovar este pagamento manual?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, aprovar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostra loading
        Swal.fire({
          title: 'Processando...',
          text: 'Aguarde enquanto aprovamos o pagamento.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        this.http
          .patch(
            `${environment.serverUrl}/api/admin/orders/${this.sale.id}/approve`,
            {}
          )
          .subscribe({
            next: () => {
              Swal.fire(
                'Aprovado!',
                'O pagamento foi aprovado com sucesso.',
                'success'
              );
              this.updated.emit();
              this.onClose();
            },
            error: () => {
              Swal.fire(
                'Erro!',
                'Não foi possível aprovar o pagamento.',
                'error'
              );
            },
          });
      }
    });
  }

  rejectSale() {
    Swal.fire({
      title: 'Reprovar pagamento?',
      text: 'Deseja reprovar este pagamento manual?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, reprovar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostra loading
        Swal.fire({
          title: 'Processando...',
          text: 'Aguarde enquanto reprovamos o pagamento.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        this.http
          .patch(
            `${environment.serverUrl}/api/admin/orders/${this.sale.id}/reject`,
            {}
          )
          .subscribe({
            next: () => {
              Swal.fire('Reprovado!', 'O pagamento foi reprovado.', 'success');
              this.updated.emit();
              this.onClose();
            },
            error: () => {
              Swal.fire(
                'Erro!',
                'Não foi possível reprovar o pagamento.',
                'error'
              );
            },
          });
      }
    });
  }
}
