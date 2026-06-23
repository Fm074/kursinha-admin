import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            {{ label }}
          </p>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            <span *ngIf="isCurrency">Kz </span>{{ value | number: (isCurrency ? '1.0-0' : '1.0-0') }}
          </h3>
        </div>
        <div 
          [class]="'p-2 rounded-lg ' + iconBgClass"
          [innerHTML]="icon"
        ></div>
      </div>
      
      <div class="mt-4 flex items-center gap-2" *ngIf="trend !== undefined">
        <span 
          [class]="'flex items-center gap-1 text-xs font-bold ' + (trend >= 0 ? 'text-emerald-500' : 'text-rose-500')"
        >
          <svg *ngIf="trend >= 0" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
          <svg *ngIf="trend < 0" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
          {{ trend / 100 | percent:'1.1-1' }}
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500">vs período anterior</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class KpiCardComponent {
  @Input() label: string = '';
  @Input() value: number = 0;
  @Input() isCurrency: boolean = false;
  @Input() icon: string = '';
  @Input() iconBgClass: string = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600';
  @Input() trend?: number; // em porcentagem, ex: 15.5
}
