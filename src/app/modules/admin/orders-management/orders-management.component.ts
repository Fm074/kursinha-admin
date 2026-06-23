import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../../layout/common/header-admin/header-admin.component';
import { SalesDetailsModalComponent } from './components/sales-details-modal/sales-details-modal.component';
import { OrdersManagementService } from './services/orders-management.service';
import { KpiCardComponent } from '../sales-management/components/kpi-card/kpi-card.component';
import { SalesChartComponent } from '../sales-management/components/sales-chart/sales-chart.component';
import { PeriodFilterComponent } from '../sales-management/components/period-filter/period-filter.component';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';

interface Order {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: any[];
}

@Component({
  selector: 'app-orders-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderAdminComponent,
    SalesDetailsModalComponent,
    KpiCardComponent,
    SalesChartComponent,
    PeriodFilterComponent,
  ],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.scss',
})
export class OrdersManagementComponent implements OnInit {
  orders: Order[] = [];

  // Filtros
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPayment: string = '';

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 10;
  totalPaginas = 1;

  // KPIs
  stats: any = {
    totalSales: 0,
    totalRevenue: 0,
    netRevenue: 0,
    totalRefunds: 0,
    refundAmount: 0,
    totalCommissions: 0,
    suspiciousActivities: 0,
  };

  isSaleDetailsOpen = false;
  selectedSale: any = null;

  salesData: any = [];
  currentChartType: 'sales' | 'refunds' | 'commissions' = 'sales';
  tiposDeGrafico: string[] = ['sales', 'refunds', 'commissions'];
  
  salesPeriodFilter: any = {
    period: '30d',
    startDate: null,
    endDate: null
  };

  protected Math = Math;
  private searchSubject = new Subject<string>();

  constructor(
    private ordersManagamentService: OrdersManagementService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadAllData();
    });
  }

  // Abrir modal
  openSaleDetails(sale: any) {
    this.selectedSale = sale;
    this.isSaleDetailsOpen = true;
  }

  closeSaleDetails() {
    this.isSaleDetailsOpen = false;
    this.selectedSale = null;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.searchTerm = params['search'] || '';
        this.selectedStatus = params['status'] || '';
        this.selectedPayment = params['paymentMethod'] || '';
        this.paginaAtual = +params['page'] || 1;
      }
      this.loadAllData();
    });
  }

  loadAllData() {
    this.loadReport();
    this.loadChartData();
    this.loadOrders();
  }

  loadReport(): void {
    const range = this.getPeriodRange();
    if (!range.startDate || !range.endDate) return;

    this.ordersManagamentService.getOrdersReport(range.startDate, range.endDate).subscribe({
      next: (response) => {
        const data = response.data;
        this.stats = {
          totalSales: data.totalSales,
          totalRevenue: data.totalRevenue,
          netRevenue: data.netRevenue,
          totalRefunds: data.totalRefunds || 0,
          refundAmount: data.refundAmount,
          totalCommissions: data.totalRevenue - data.netRevenue,
          suspiciousActivities: 0,
        };
      },
      error: () => {
        Swal.fire('Erro', 'Falha ao carregar relatório', 'error');
      },
    });
  }

  loadChartData(): void {
    const { period, startDate, endDate } = this.salesPeriodFilter;
    if (!period) return;

    const start = typeof startDate === 'string' ? startDate : startDate?.toISOString();
    const end = typeof endDate === 'string' ? endDate : endDate?.toISOString();

    this.ordersManagamentService
      .getOrdersPerformance(period, this.currentChartType, start, end)
      .subscribe({
        next: (response: any) => {
          this.salesData = response.data.data;
        },
        error: () => {},
      });
  }

  loadOrders() {
    const range = this.getPeriodRange();
    const params: any = {
      page: this.paginaAtual,
      limit: this.itensPorPagina,
      search: this.searchTerm,
      status: this.selectedStatus,
      paymentMethod: this.selectedPayment,
      startDate: range.startDate,
      endDate: range.endDate
    };

    this.ordersManagamentService.getAllOrders(params).subscribe({
      next: (res) => {
        this.orders = res.data.orders || res.data.docs || res.data;
        this.totalPaginas = res.data.pagination?.totalPages || Math.ceil((res.data.totalDocs || this.orders.length) / this.itensPorPagina);
        this.paginaAtual = res.data.pagination?.page || this.paginaAtual;
      },
      error: (err) => {
        console.error('Erro ao carregar orders: ', err);
      },
    });
  }

  getPeriodRange() {
    let start, end;
    if (this.salesPeriodFilter.period === 'custom') {
      start = this.salesPeriodFilter.startDate;
      end = this.salesPeriodFilter.endDate;
    } else {
      start = this.salesPeriodFilter.startDate;
      end = this.salesPeriodFilter.endDate;
    }

    if (!start || !end) {
      const d = new Date();
      end = d.toISOString();
      const s = new Date();
      s.setDate(d.getDate() - 30);
      start = s.toISOString();
    }

    return { 
      startDate: typeof start === 'string' ? start : start?.toISOString(), 
      endDate: typeof end === 'string' ? end : end?.toISOString() 
    };
  }

  onFilterByPeriod(event: any): void {
    this.salesPeriodFilter = event;
    this.loadAllData();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange() {
    this.paginaAtual = 1;
    this.updateQueryParams();
    this.loadAllData();
  }

  onChartTypeSelect(type: any) {
    this.currentChartType = type;
    this.loadChartData();
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm || null,
        status: this.selectedStatus || null,
        paymentMethod: this.selectedPayment || null,
        page: this.paginaAtual > 1 ? this.paginaAtual : null
      },
      queryParamsHandling: 'merge'
    });
  }

  trocarPagina(pagina: any) {
    if (typeof pagina === 'string' || pagina === -1) return;
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
    this.updateQueryParams();
    this.loadOrders();
  }

  getPaginasArray(): number[] {
    const total = this.totalPaginas;
    const current = this.paginaAtual;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // -1 for ellipsis

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  cancelSale(order: Order): void {
    Swal.fire({
      title: 'Cancelar Venda?',
      text: `Tem certeza que deseja cancelar a venda #${order.id}? Esta ação não pode ser desfeita.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Não',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordersManagamentService.cancelSale(order.id).subscribe({
          next: () => {
            Swal.fire('Sucesso!', 'Venda cancelada com sucesso.', 'success');
            this.loadOrders();
          },
          error: (err) => {
            console.error('Erro ao cancelar venda:', err);
            Swal.fire('Erro', 'Falha ao cancelar a venda. Tente novamente.', 'error');
          },
        });
      }
    });
  }
}
