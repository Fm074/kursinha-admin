import { Component } from '@angular/core';
import { HeaderAdminComponent } from '../../../layout/common/header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SalesDetailsModalComponent,
  VendaDetalhes,
} from './components/sales-details-modal/sales-details-modal.component';
import { SalesReport } from './interfaces/sales.interface';
import {
  periodSalesPerformance,
  SalesService,
} from './services/sales-management.service';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import Swal from 'sweetalert2';

export type ChartType = 'sales' | 'refunds' | 'commissions';

@Component({
  selector: 'app-sales-management',
  imports: [
    HeaderAdminComponent,
    CommonModule,
    PeriodFilterComponent,
    SalesChartComponent,
    FormsModule,
    ReactiveFormsModule,
    SalesDetailsModalComponent,
    KpiCardComponent,
  ],
  templateUrl: './sales-management.component.html',
  styleUrl: './sales-management.component.scss',
})
export class SalesManagementComponent {
  salesReport!: SalesReport;
  stats: any = {
    totalSales: 0,
    totalRevenue: 0,
    netRevenue: 0,
    totalRefunds: 0,
    refundAmount: 0,
    totalCommissions: 0,
    suspiciousActivities: 0,
  };

  tiposDeGrafico: ChartType[] = ['sales', 'refunds', 'commissions'];
  currentChartType: ChartType = 'sales';
  protected Math = Math;

  searchTerm = '';
  shortSearchTerm = '';
  selectedStatus = '';
  selectedPaymentMethod = '';
  selectedProduct = '';
  selectedSeller = '';
  selectedAffiliate = '';

  vendas: any[] = [];
  vendaSelecionada: any;
  modalAberto = false;

  paginaAtual = 1;
  itensPorPagina = 10;
  totalItens = 0;

  salesData: any = [];
  salesPeriodFilter: any = {
    period: '30d',
    startDate: null,
    endDate: null
  };

  private searchSubject = new Subject<string>();

  constructor(
    private salesService: SalesService,
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

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.searchTerm = params['search'] || '';
        this.selectedStatus = params['status'] || '';
        this.selectedPaymentMethod = params['paymentMethod'] || '';
        this.paginaAtual = +params['page'] || 1;
      }
      this.loadAllData();
    });
  }

  loadAllData() {
    this.loadReport();
    this.loadChartData();
    this.loadSalesTable();
  }

  loadReport(): void {
    const range = this.getPeriodRange();
    if (!range.startDate || !range.endDate) return;

    this.salesService.getSalesReportByRange(range.startDate, range.endDate).subscribe({
      next: (response) => {
        this.salesReport = response.data;
        this.stats = {
          totalSales: response.data.totalSales,
          totalRevenue: response.data.totalRevenue,
          netRevenue: response.data.netRevenue,
          totalRefunds: response.data.totalRefunds,
          refundAmount: response.data.refundAmount,
          totalCommissions: response.data.totalRevenue - response.data.netRevenue,
          suspiciousActivities: 0,
        };
      },
      error: () => {
        Swal.fire('Erro', 'Falha ao carregar relatório de vendas', 'error');
      },
    });
  }

  loadChartData(): void {
    const { period, startDate, endDate } = this.salesPeriodFilter;
    if (!period) return;

    this.salesService
      .getSalesPerformance(period, this.currentChartType, startDate, endDate)
      .subscribe({
        next: (response: any) => {
          this.salesData = response.data.data;
        },
        error: () => {},
      });
  }

  loadSalesTable(): void {
    const range = this.getPeriodRange();
    const params = {
      page: this.paginaAtual,
      limit: this.itensPorPagina,
      search: this.searchTerm,
      status: this.selectedStatus,
      paymentMethod: this.selectedPaymentMethod,
      productId: this.selectedProduct,
      sellerId: this.selectedSeller,
      affiliateId: this.selectedAffiliate,
      startDate: range.startDate,
      endDate: range.endDate
    };

    this.salesService.getSalesList(params).subscribe({
      next: (res) => {
        this.vendas = res.data.docs || res.data;
        this.totalItens = res.data.totalDocs || this.vendas.length;
      },
      error: () => {
        this.vendas = [];
      }
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

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm || null,
        status: this.selectedStatus || null,
        paymentMethod: this.selectedPaymentMethod || null,
        page: this.paginaAtual > 1 ? this.paginaAtual : null
      },
      queryParamsHandling: 'merge'
    });
  }

  onPageChange(page: any) {
    if (typeof page === 'string') return;
    this.paginaAtual = page;
    this.updateQueryParams();
    this.loadSalesTable();
  }


  onChartTypeSelect(type: ChartType) {
    this.currentChartType = type;
    this.loadChartData();
  }

  getPaginatedVendas() {
    return this.vendas;
  }

  getTotalPages() {
    return Math.ceil(this.totalItens / this.itensPorPagina);
  }

  getPageNumbers() {
    const total = this.getTotalPages();
    const current = this.paginaAtual;
    const pages = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  abrirDetalhes(venda: any): void {
    this.vendaSelecionada = venda;
    this.modalAberto = true;
  }

  reembolsarVenda(venda: any): void {
    this.salesService
      .createRefund(venda.id, {
        amount: venda.valor,
        reason: 'Reembolso manual',
      })
      .subscribe({
        next: () =>
          Swal.fire('Sucesso', 'Reembolso criado com sucesso', 'success'),
        error: () => Swal.fire('Erro', 'Erro ao criar reembolso', 'error'),
      });
  }
  // ---
  
}
