import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexTooltip,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  title?: ApexTitleSubtitle;
  colors?: string[];
  fill?: any;
  grid?: any;
};

@Component({
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  imports: [CommonModule, NgApexchartsModule],
  styleUrl: './sales-chart.component.scss',
})
export class SalesChartComponent implements OnChanges, OnInit {
  @Input() chartData: { date: string; amount: number }[] = [];
  @Input() chartType: 'sales' | 'refunds' | 'commissions' = 'sales';

  chartOptions: Partial<ChartOptions> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['chartType']) {
      this.updateChart();
    }
  }

  ngOnInit(): void {
    this.updateChart();
  }

  updateChart(): void {
    const labels = this.chartData.map((d) => d.date);
    const values = this.chartData.map((d) => d.amount);

    const titleMap = {
      sales: 'Vendas por Período',
      refunds: 'Reembolsos por Período',
      commissions: 'Comissões por Período',
    };

    const colorMap = {
      sales: '#3b82f6', // blue-500
      refunds: '#ef4444', // red-500
      commissions: '#f59e0b', // amber-500
    };

    const isDark = document.documentElement.classList.contains('dark');

    this.chartOptions = {
      series: [
        {
          name: titleMap[this.chartType],
          data: values,
        },
      ],
      chart: {
        type: 'area',
        height: 380,
        toolbar: { show: false },
        background: 'transparent',
        foreColor: isDark ? '#9ca3af' : '#4b5563',
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        zoom: { enabled: false },
      },
      colors: [colorMap[this.chartType]],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            fontSize: '11px',
            fontWeight: 500,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          formatter: (val) => `Kz ${val.toLocaleString()}`,
          style: {
            fontSize: '11px',
            fontWeight: 500,
          },
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        x: { format: 'dd MMM yyyy' },
        y: {
          formatter: (val) => `Kz ${val.toLocaleString()}`,
        },
      },
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 10,
        },
      },
    };
  }
}
