import { Component, OnInit } from '@angular/core';
import { ProductManagementService } from './services/product-management.service';
import { Product } from '../../../interfaces/product';
import { HeaderAdminComponent } from '../../../layout/common/header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../layout/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss'],
  imports: [
    HeaderAdminComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  totalProducts = 0;
  loading = false;

  // Filters
  filters = {
    search: '',
    category: '',
    status: '',
    producer: '',
    page: 1,
    limit: 10,
  };

  // Sample data for dropdowns
  categories: any;
  producers: any;

  isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  constructor(private productService: ProductManagementService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  onNameSearch() {
    setTimeout(() => {
      this.loadProducts();
    }, 3000);
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts(this.filters).subscribe({
      next: (response: any) => {
        this.products = response?.data?.products || [];

        this.categories = this.products.reduce((acc: string[], product) => {
          const category = product?.category;
          if (category && !acc.includes(category)) {
            acc.push(category);
          }
          return acc;
        }, []);

        this.producers = this.products.reduce((acc: string[], product) => {
          const name = product.client?.name;
          if (name && !acc.includes(name)) {
            acc.push(name);
          }
          return acc;
        }, []);

        this.totalProducts =
          response.data?.pagination?.total || this.products.length;
        console.log(this.totalProducts);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      },
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadProducts();
  }

  async approveProduct(productId: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Confirmar ativação',
      text: 'Tem certeza que deseja ativar este produto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: this.isDark ? 'dark' : '',
        confirmButton:
          'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded' +
          (this.isDark ? ' dark' : ''),
        cancelButton:
          'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-3' +
          (this.isDark ? ' dark' : ''),
      },
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Aguarde',
        text: 'Ativando produto...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: {
          popup: this.isDark ? 'dark' : '',
        },
      });

      this.productService.approveProduct(productId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Sucesso!',
            text: 'Produto ativado com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
              popup: this.isDark ? 'dark' : '',
              confirmButton:
                'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded' +
                (this.isDark ? ' dark' : ''),
            },
          });
          this.loadProducts();
        },
        error: (error) => {
          Swal.fire({
            title: 'Erro!',
            text: error.error?.message || 'Falha ao ativar o produto.',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              popup: this.isDark ? 'dark' : '',
              confirmButton:
                'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded' +
                (this.isDark ? ' dark' : ''),
            },
          });
        },
      });
    }
  }

  async rejectProduct(productId: string): Promise<void> {
    const { value: reason } = await Swal.fire({
      title: 'Motivo da rejeição',
      input: 'textarea',
      inputLabel: 'Informe o motivo para rejeitar este produto',
      inputPlaceholder: 'Digite aqui o motivo...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar rejeição',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) =>
        !value ? 'Por favor, informe o motivo!' : null,
      background: '#1F2937',
      color: '#F9FAFB',
      customClass: {
        popup: 'dark-mode-swal',
        confirmButton:
          'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded',
        cancelButton:
          'bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mr-3',
      },
    });

    if (reason) {
      Swal.fire({
        title: 'Aguarde',
        text: 'Rejeitando produto...',
        allowOutsideClick: false,
        background: '#1F2937',
        color: '#F9FAFB',
        didOpen: () => Swal.showLoading(),
      });

      this.productService.rejectProduct(productId, reason).subscribe({
        next: () => {
          Swal.fire({
            title: 'Sucesso!',
            text: 'Produto rejeitado com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK',
            background: '#1F2937',
            color: '#F9FAFB',
          });
          this.loadProducts();
        },
        error: (error) => {
          Swal.fire({
            title: 'Erro!',
            text: error.error?.message || 'Falha ao rejeitar o produto.',
            icon: 'error',
            confirmButtonText: 'OK',
            background: '#1F2937',
            color: '#F9FAFB',
          });
        },
      });
    }
  }

  async pauseProduct(productId: string): Promise<void> {
    const { value: reason } = await Swal.fire({
      title: 'Motivo da pausa',
      input: 'textarea',
      inputLabel: 'Informe o motivo para pausar este produto',
      inputPlaceholder: 'Digite aqui o motivo...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar pausa',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) =>
        !value ? 'Por favor, informe o motivo!' : null,
      background: '#1F2937',
      color: '#F9FAFB',
      customClass: {
        confirmButton:
          'bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded',
        cancelButton:
          'bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mr-3',
      },
    });

    if (reason) {
      Swal.fire({
        title: 'Aguarde',
        text: 'Pausando produto...',
        allowOutsideClick: false,
        background: '#1F2937',
        color: '#F9FAFB',
        didOpen: () => Swal.showLoading(),
      });

      this.productService.pauseProduct(productId, reason).subscribe({
        next: () => {
          Swal.fire({
            title: 'Sucesso!',
            text: 'Produto pausado com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK',
            background: '#1F2937',
            color: '#F9FAFB',
          });
          this.loadProducts();
        },
        error: (error) => {
          Swal.fire({
            title: 'Erro!',
            text: error.error?.message || 'Falha ao pausar o produto.',
            icon: 'error',
            confirmButtonText: 'OK',
            background: '#1F2937',
            color: '#F9FAFB',
          });
        },
      });
    }
  }

  viewPerformance(productId: string): void {
    Swal.fire({
      title: 'Carregando métricas...',
      allowOutsideClick: false,
      background: '#1F2937',
      color: '#F9FAFB',
      didOpen: () => Swal.showLoading(),
    });

    this.productService.getProductAnalytics(productId).subscribe({
      next: (response) => {
        const analytics = response?.data;
        Swal.fire({
          title: `<span class="text-2xl font-bold text-white">${analytics.product.name}</span>`,
          html: `
          <div class="text-left space-y-6 text-gray-200">
            <div class="flex items-center space-x-4">
              <span class="px-3 py-1 rounded-full text-xs font-medium ${
                analytics.product.status === 'ACTIVE'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-600 text-white'
              }">
                ${this.getStatusText(analytics.product.status)}
              </span>
              <span class="text-sm text-gray-300">${
                analytics.product.category
              }</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gray-700 p-4 rounded-lg">
                <p class="text-sm text-gray-300">Vendas Totais</p>
                <p class="text-2xl font-bold text-white">${
                  analytics.metrics.totalSales
                }</p>
              </div>
              <div class="bg-gray-700 p-4 rounded-lg">
                <p class="text-sm text-gray-300">Receita Total</p>
                <p class="text-2xl font-bold text-white">Kz ${analytics.metrics.totalRevenue.toFixed(
                  2
                )}</p>
              </div>
              <div class="bg-gray-700 p-4 rounded-lg">
                <p class="text-sm text-gray-300">Ticket Médio</p>
                <p class="text-2xl font-bold text-white">Kz ${analytics.metrics.averageTicket.toFixed(
                  2
                )}</p>
              </div>
              <div class="bg-gray-700 p-4 rounded-lg">
                <p class="text-sm text-gray-300">Taxa de Conversão</p>
                <p class="text-2xl font-bold text-white">${analytics.metrics.conversionRate.toFixed(
                  1
                )}%</p>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-white mb-3">Últimas Vendas</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-600 text-sm text-white">
                  <thead class="bg-gray-800">
                    <tr>
                      <th class="px-4 py-2 text-left">Comprador</th>
                      <th class="px-4 py-2 text-left">Valor</th>
                      <th class="px-4 py-2 text-left">Data</th>
                      <th class="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-gray-900 divide-y divide-gray-700">
                    ${analytics.recentSales
                      .map(
                        (sale: any) => `
                        <tr>
                          <td class="px-4 py-2">${
                            sale.buyer?.name || 'N/A'
                          }</td>
                          <td class="px-4 py-2">Kz ${sale.amount.toFixed(
                            2
                          )}</td>
                          <td class="px-4 py-2">${new Date(
                            sale.createdAt
                          ).toLocaleDateString()}</td>
                          <td class="px-4 py-2">
                            <span class="px-2 py-1 text-xs rounded-full ${
                              sale.status === 'PENDING'
                                ? 'bg-yellow-600 text-white'
                                : sale.status === 'COMPLETED'
                                ? 'bg-green-700 text-white'
                                : 'bg-gray-600 text-white'
                            }">${
                          sale.status === 'PENDING' ? 'Pendente' : 'Concluído'
                        }</span>
                          </td>
                        </tr>
                      `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `,
          width: '900px',
          background: '#1F2937',
          color: '#F9FAFB',
          padding: '2rem',
          showConfirmButton: false,
          showCloseButton: true,
          customClass: {
            container: 'modern-analytics-modal',
            closeButton: 'text-gray-400 hover:text-white',
            popup: 'rounded-xl shadow-2xl border border-gray-700',
          },
        });
      },
      error: () => {
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível carregar as métricas deste produto.',
          icon: 'error',
          background: '#1F2937',
          color: '#F9FAFB',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton:
              'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
          },
        });
      },
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      ACTIVE: 'Aprovado',
      INACTIVE: 'Inactivo',
      REJECTED: 'Rejeitado',
      PENDING: 'Pendente',
    };
    return statusMap[status] || status;
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalProducts / 10);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getProductInfo(product: Product) {
    console.log('Product Info:', product);
  }
}
