import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  FeesConfig,
  FinanceManagementService,
} from '../finance-management/services/finance-management.service';
import Swal from 'sweetalert2';
import { WithdrawalService } from './services/withdrawal.service';
import { CommonModule } from '@angular/common';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexLegend,
} from 'ng-apexcharts';
// import { HeaderAdminComponent } from '../../../layout/common/header-admin/header-admin.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors?: string[];
};

// Adicione esta interface no componente
interface FinancialData {
  period: string;
  transaction_type: string;
  daily_data: {
    date: string;
    amount: number;
  }[];
}

interface Withdrawal {
  id: string;
  userName: string;
  userType: 'AFFILIATE' | 'PRODUCER';
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  client: {
    id: string;
    name: string;
    email: string;
    document: string;
  };

  processedAt?: string | Date;
  bankAccount?: WithdrawalBankAccount;
  notes?: string;
  paymentMethod: string;
  info?: any;
}

interface WithdrawalBankAccount {
  id?: string;
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  accountNumber?: string;
  swift?: string;
  document?: string; // BI / NIF / passaporte
}

interface WithdrawalClient {
  name?: string;
  email?: string;
  document?: string;
}

@Component({
  selector: 'app-financial-dashboard',
  templateUrl: './finance-management.component.html',
  styleUrls: ['./finance-management.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgApexchartsModule],
})
export class FinanceManagementComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions!: ChartOptions;
  withdrawals: Withdrawal[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalWithdrawals = 0;
  Math = Math;

  // Financial KPIs
  kpis = {
    totalMovement: 540000,
    totalWithdrawn: 120000,
    totalCommissions: 80000,
  };

  // Chart data
  chartData = {
    labels: ['01/06', '02/06', '03/06', '04/06', '05/06', '06/06', '07/06'],
    datasets: [
      {
        label: 'Movimentação (Kz)',
        data: [120000, 90000, 75000, 110000, 95000, 80000, 130000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Fee settings form
  feeForm: FormGroup;

  // Filters
  filters = {
    transactionType: 'all',
    period: '30d',
  };

  selectedWithdrawal: Withdrawal | null = null;
  showDetailsModal = false;

  isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  initChart(): void {
    this.chartOptions = {
      series: [
        {
          name: 'Movimentação',
          data: [120000, 90000, 75000, 110000, 95000, 80000, 130000],
        },
      ],
      chart: {
        type: 'line',
        height: 350,
        width: '100%',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        foreColor: this.isDark ? '#d1d5db' : '#6B7280', // dark:text-gray-300 / gray-500
        background: this.isDark ? '#1f2937' : '#ffffff', // dark:bg-gray-800 / white
      },
      colors: [this.isDark ? '#60A5FA' : '#3B82F6'], // lighter blue in dark
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: {
          colors: this.isDark ? '#f3f4f6' : '#6B7280', // dark:text-gray-100
        },
      },
      xaxis: {
        categories: [
          '01/06',
          '02/06',
          '03/06',
          '04/06',
          '05/06',
          '06/06',
          '07/06',
        ],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: this.isDark ? '#d1d5db' : '#6B7280', // gray-300 vs gray-500
          },
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `Kz ${value.toLocaleString()}`,
          style: {
            colors: this.isDark ? '#d1d5db' : '#6B7280',
          },
        },
      },
      tooltip: {
        theme: this.isDark ? 'dark' : 'light',
        y: {
          formatter: (value: number) => `Kz ${value.toLocaleString()}`,
        },
      },
    };
  }

  loading = false;
  saving = false;
  constructor(
    private fb: FormBuilder,
    private withdrawalService: WithdrawalService,
    private FinanceManagementService: FinanceManagementService
  ) {
    this.feeForm = this.fb.group({
      platformFee: [0],
      serviceFeePercentage: [0, [Validators.min(0), Validators.max(100)]],
      withdrawalFeePercentage: [0, [Validators.min(0), Validators.max(100)]],
      fixedWithdrawalFee: [0, [Validators.min(0)]],
      minimumWithdrawalAmount: [0, [Validators.min(0)]],
      platformFeeCheckout: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    this.loadWithdrawals();
    this.loadFeeSettings();
    this.initChart();
    this.loadFinancialData();
    this.loadFeeSettings();

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        this.isDark = e.matches;
        this.initChart();
      });
  }

  // Adicione este método para carregar os dados financeiros
  loadFinancialData(): void {
    const params = {
      period: this.filters.period || '30d',
      transaction_type: this.filters.transactionType || 'all',
      ...(this.filters.period === 'custom' && {
        start_date: '2025-06-01',
        end_date: '2025-06-10',
      }),
    };

    this.FinanceManagementService.getFinancialData(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.updateChartWithFinancialData(response.data);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dados financeiros:', error);
      },
    });
  }

  // Método para atualizar o gráfico com os dados da API
  updateChartWithFinancialData(data: FinancialData): void {
    const dates = data.daily_data.map((item) => {
      // Formata a data para o formato DD/MM
      const [year, month, day] = item.date.split('-');
      return `${day}/${month}`;
    });

    const amounts = data.daily_data.map((item) => item.amount);

    // Atualiza os KPIs com base nos dados (exemplo)
    this.kpis.totalWithdrawn = amounts.reduce((sum, amount) => sum + amount, 0);

    // Atualiza o gráfico
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: 'Movimentação',
          data: amounts,
        },
      ],
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: dates,
      },
    };

    // Se estiver usando ApexCharts e precisar atualizar o gráfico dinamicamente
    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  // Atualize o método que lida com mudanças de filtro
  onFilterChange(): void {
    this.loadFinancialData();
  }

  loadWithdrawals(): void {
    this.withdrawalService
      .getWithdrawals(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.withdrawals = response.data;
          this.totalWithdrawals = response.total;
        },
        error: (error) => {
          Swal.fire('Erro', 'Falha ao carregar saques', 'error');
        },
      });
  }

  loadFeeSettings(): void {
    this.loading = true;
    this.FinanceManagementService.getPlatformFees().subscribe({
      next: (fees) => {
        console.log('fees: ', fees);
        this.feeForm.patchValue(fees);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  saveFeeSettings(): void {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      Swal.fire({
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha corretamente todos os campos antes de salvar.',
        icon: 'warning',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#00F4FC',
      });
      return;
    }

    this.saving = true;
    const fees: FeesConfig = this.feeForm.getRawValue();

    this.FinanceManagementService.updatePlatformFees(fees).subscribe({
      next: () => {
        this.saving = false;
        Swal.fire({
          title: 'Configurações salvas!',
          text: 'As taxas da plataforma foram atualizadas com sucesso.',
          icon: 'success',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#00F4FC',
        });
      },
      error: (error) => {
        this.saving = false;
        Swal.fire({
          title: 'Erro ao salvar',
          text: 'Ocorreu uma falha ao tentar salvar as configurações. Tente novamente em instantes.',
          icon: 'error',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#00F4FC',
        });
        console.error('Erro ao salvar configurações:', error);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadWithdrawals();
  }

  approveWithdrawal(withdrawal: Withdrawal): void {
    Swal.fire({
      title: 'Confirmar aprovação',
      text: `Deseja aprovar o saque de ${withdrawal.userName} no valor de Kz ${withdrawal.amount}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aprovar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton:
          'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded',
        cancelButton:
          'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-3',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.withdrawalService.approveWithdrawal(withdrawal.id).subscribe({
          next: () => {
            this.showSuccessToast('Saque aprovado com sucesso');
            this.showDetailsModal = false;
            this.loadWithdrawals();
          },
          error: () => {
            this.showErrorToast('Falha ao aprovar saque');
          },
        });
      }
    });
  }

  rejectWithdrawal(withdrawal: Withdrawal): void {
    Swal.fire({
      title: 'Motivo da recusa',
      input: 'textarea',
      inputLabel: 'Informe o motivo para recusar este saque',
      inputPlaceholder: 'Digite aqui...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar recusa',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor, informe o motivo!';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.withdrawalService
          .rejectWithdrawal(withdrawal.id, result.value)
          .subscribe({
            next: () => {
              this.showSuccessToast('Saque recusado com sucesso');
              this.loadWithdrawals();
              this.showDetailsModal = false;
            },
            error: () => {
              this.showErrorToast('Falha ao recusar saque');
            },
          });
      }
    });
  }

  exportReport(format: 'csv' | 'excel'): void {
    this.FinanceManagementService.exportReport(this.filters, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_financeiro_${new Date()
          .toISOString()
          .slice(0, 10)}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.showErrorToast('Falha ao exportar relatório');
      },
    });
  }

  private showSuccessToast(message: string): void {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-4 right-4 flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50';
    toast.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  private showErrorToast(message: string): void {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-4 right-4 flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50';
    toast.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
      </svg>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  getUserTypeBadge(userType: string): string {
    return userType === 'AFFILIATE'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }

  getUserTypeText(userType: string): string {
    return userType === 'AFFILIATE' ? 'Afiliado' : 'Produtor';
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovado';
      case 'REJECTED':
        return 'Recusado';
      default:
        return status;
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'MULTICAIXA':
        return 'Multicaixa';
      case 'UNITEL_MONEY':
        return 'Unitel Money';
      case 'PAYPAL':
        return 'PayPal';
      default:
        return method;
    }
  }

  openWithdrawalDetails(withdrawal: Withdrawal) {
    this.selectedWithdrawal = withdrawal;
    this.showDetailsModal = true;
  }

  closeWithdrawalDetails() {
    this.showDetailsModal = false;
    this.selectedWithdrawal = null;
  }

  // Método para traduzir o tipo de conta
  getAccountTypeLabel(accountType: string): string {
    const types: { [key: string]: string } = {
      Current: 'Conta Corrente',
      Savings: 'Conta Poupança',
      Checking: 'Conta à Ordem',
      Business: 'Conta Empresarial',
      Salary: 'Conta Salário',
    };

    return types[accountType] || accountType || '—';
  }

  // Verificar se há informações bancárias adicionais
  hasAdditionalBankInfo(): boolean {
    const info = this.selectedWithdrawal?.info;
    return !!(
      info?.swift ||
      info?.iban ||
      info?.accountHolder ||
      info?.document
    );
  }

  // Se quiser um método para pegar todas as informações bancárias de forma organizada:
  getBankInfo(): any {
    const info = this.selectedWithdrawal?.info;
    if (!info) return null;

    return {
      banco: info.bankName || '—',
      titular: info.accountName || '—',
      numeroConta: info.accountNumber || '—',
      tipoConta: this.getAccountTypeLabel(info.accountType),
      iban: info.iban || '—',
      swift: info.swift || '—',
      documento: info.document || '—',
      contaPadrao: info.isDefault ? 'Sim' : 'Não',
      criadaEm: info.createdAt ? new Date(info.createdAt) : null,
    };
  }
}
