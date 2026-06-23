import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-product-card',
    imports: [CommonModule],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() image?: string; // URL da imagem
  @Input() name: string = 'Nome do Produto'; // Nome do produto
  @Input() status: 'active' | 'inactive' = 'inactive'; // Status do produto
  
}