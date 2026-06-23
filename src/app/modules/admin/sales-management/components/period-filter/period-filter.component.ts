import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-period-filter',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './period-filter.component.html',
  styleUrl: './period-filter.component.scss',
})
export class PeriodFilterComponent implements OnInit{
  selectedPreset: string = '7d';
  @Output() periodPresetSelected = new EventEmitter<string>();
  @Output() periodSelected = new EventEmitter<{
    startDate: Date;
    endDate: Date;
    period: string;
  }>();

  presets = [
    { label: 'Últimas 24h', value: '24h' },
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Personalizado', value: 'custom' },
  ];

  customStartDate: string = '';
  customEndDate: string = '';

  ngOnInit(){
    this.onSelectPreset('30d');
  }

  onSelectPreset(value: string) {
    this.selectedPreset = value;

    if (value !== 'custom') {
      const end = new Date();
      let start = new Date();
      let period = '';
      switch (value) {
        case '24h':
          start.setDate(end.getDate() - 1);
          period = '24h';
          break;
        case '7d':
          start.setDate(end.getDate() - 7);
          period = '7d';
          break;
        case '30d':
          start.setDate(end.getDate() - 30);
          period = '30d';
          break;
      }

      this.periodSelected.emit({
        startDate: start,
        endDate: end,
        period: period,
      });
    }
  }

  applyCustomRange() {
    if (this.customStartDate && this.customEndDate) {
      this.periodSelected.emit({
        startDate: new Date(this.customStartDate),
        endDate: new Date(this.customEndDate),
        period: 'custom',
      });
    }
  }
}
