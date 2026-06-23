import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  DashboardManagementService,
  DashboardOverview,
} from './services/dashboard-management.service';

@Component({
  selector: 'app-dashboard-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-management.component.html',
  styleUrl: './dashboard-management.component.scss',
})
export class DashboardManagementComponent implements OnInit {
  overview?: DashboardOverview;
  kpis?: any;

  selectedTimeframe: 'today' | 'week' | 'month' | 'year' | 'personalized' | 'all' = 'all';
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;

  stats: {
    title: string;
    value: string | number;
    description: string;
    icon: string;
  }[] = [];

  constructor(private dashboardService: DashboardManagementService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    forkJoin({
      dashboard: this.dashboardService.getDashboard(
        this.selectedTimeframe,
        this.startDate,
        this.endDate
      ),
      kpis: this.dashboardService.getKpis(
        this.selectedTimeframe,
        this.startDate,
        this.endDate
      ),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.dashboard.success) {
            this.overview = res.dashboard.data.overview;
            this.buildStats();
          }
          if (res.kpis.success) {
            this.kpis = res.kpis.data;
            this.buildStats1();
          }
        },
        error: (err) => {
          console.error('Error loading dashboard data', err);
        },
      });
  }

  onTimeframeChange(timeframe: any) {
    this.selectedTimeframe = timeframe;
    if (timeframe !== 'personalized') {
      this.loadData();
    }
  }

  applyCustomRange() {
    if (this.startDate && this.endDate) {
      this.loadData();
    }
  }
  /**
   * Estatísticas do dashboard
   * @returns Array de objetos com título, valor, descrição e ícone
   */
  buildStats() {
    if (!this.overview) return;

    this.stats = [
      {
        title: 'Usuários Totais',
        value: this.overview.totalUsers,
        description: 'Número de usuários cadastrados',
        icon: `<svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 1116 0H2z"/></svg>`,
      },
      {
        title: 'Usuários Ativos',
        value: this.overview.activatedUsers,
        description: 'Contas em funcionamento',
        icon: `<svg class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 018 8v2a8 8 0 11-16 0v-2a8 8 0 018-8z"/></svg>`,
      },
      {
        title: 'Produtos Totais',
        value: this.overview.totalProducts,
        description: 'Cadastrados no sistema',
        icon: `<svg class="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/></svg>`,
      },
      {
        title: 'Produtos Pendentes',
        value: this.overview.pendingProducts,
        description: 'Aguardando aprovação',
        icon: `<svg class="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z"/></svg>`,
      },
      {
        title: 'Vendas Totais',
        value: this.overview.totalSales,
        description: 'Pedidos concluídos',
        icon: `<svg class="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16 11V9a4 4 0 00-8 0v2H6v6h12v-6h-2z"/></svg>`,
      },
      {
        title: 'Vendas Pendentes',
        value: this.overview.pendingSales,
        description: 'Pedidos pendentes',
        icon: `<svg class="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16 11V9a4 4 0 00-8 0v2H6v6h12v-6h-2z"/></svg>`,
      },
            {
        title: 'Vendas Canceladas',
        value: this.overview.canceledSales,
        description: 'Pedidos cancelados',
        icon: `<svg class="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16 11V9a4 4 0 00-8 0v2H6v6h12v-6h-2z"/></svg>`,
      },
      {
        title: 'Receita Total',
        value: `Kz ${this.overview.totalRevenue.toLocaleString()}`,
        description: 'Movimentação financeira',
        icon: `<svg class="w-8 h-8 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path d="M12 8c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2zm-2 3c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z"/></svg>`,
      },
      {
        title: 'Saques Pendentes',
        value: this.overview.pendingWithdrawals,
        description: 'Aguardando liberação',
        icon: `<svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a7 7 0 100 14h2a7 7 0 000-14H9z"/></svg>`,
      },
    ];
  }


  buildStats1() {
    if (!this.kpis) return;

    
  }
}
