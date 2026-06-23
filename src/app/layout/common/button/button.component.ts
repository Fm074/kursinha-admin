import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    standalone: false
})

export class ButtonComponent{
  @Input() type: 'button' | 'submit' | 'reset' = 'button'; // Tipo do botão
  @Input() text: string = 'Botão'; // Texto do botão
  @Input() color: 'primary' | 'secondary' | 'success' | 'danger' | 'alternative' = 'primary'; // Cor do botão
  @Input() size: 'sm' | 'md' | 'lg' = 'md'; // Tamanho do botão
  @Input() fullWidth: boolean = false; // Se ocupa toda a largura
  @Input() disabled: boolean = false; // Se está desativado
  @Input() isLoading: boolean = false;

  @Output() buttonClick = new EventEmitter<Event>(); // Evento de clique

  private baseClasses =
    'font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none flex items-center justify-center';

  private getColorClasses(): string {
    const colorMap = {
      primary:
        'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800',
      secondary:
        'text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800',
      success:
        'text-white bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800',
      danger:
        'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800',
      alternative:
        'py-2.5 px-5 me-2 mb-2 text-sm font-medium focus:outline-none rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 text-primary-700'
    };

    return colorMap[this.color] || colorMap.primary;
  }

  get buttonClasses(): string {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }[this.size];

    return `${this.baseClasses} ${this.getColorClasses()} ${sizeClasses} ${
      this.fullWidth ? 'w-full' : 'w-fit'
    } ${this.disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  }

  onClick(event: Event) {
    if (!this.disabled) {
      this.buttonClick.emit(event); // Emite o evento de clique
    }
  }
}
