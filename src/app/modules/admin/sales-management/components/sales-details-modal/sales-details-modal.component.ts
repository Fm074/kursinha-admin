import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface VendaDetalhes {
  id: string;
  produto: string;
  tipo: 'curso' | 'ebook' | 'podcast';
  produtor: string;
  clienteNome: string;
  clienteEmail: string;
  valorPago: number;
  metodoPagamento: string;
  status: 'pago' | 'pendente' | 'reembolsado';
}

@Component({
    selector: 'app-sales-details-modal',
    imports: [CommonModule],
    templateUrl: './sales-details-modal.component.html',
    styleUrl: './sales-details-modal.component.scss'
})
export class SalesDetailsModalComponent {
  @Input() isOpen = false;
  @Input() venda!: VendaDetalhes;
  @Output() close = new EventEmitter<void>();
  @Output() reembolsar = new EventEmitter<string>(); // ID da venda

  fecharModal() {
    this.close.emit();
  }

  confirmarReembolso() {
    if (confirm('Deseja realmente reembolsar esta venda?')) {
      this.reembolsar.emit(this.venda.id);
    }
  }

  get statusCor(): string {
    switch (this.venda.status) {
      case 'pago':
        return 'text-green-600';
      case 'pendente':
        return 'text-yellow-600';
      case 'reembolsado':
        return 'text-red-600';
      default:
        return '';
    }
  }
}
