import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  standalone: false,
})
export class LoadingSpinnerComponent {
  @Input() heightClass: string = 'h-5';
  @Input() widthClass: string = 'w-5';

  get spinnerClass(): string {
    return `text-gray-200 animate-spin dark:text-gray-600 fill-primary-600 ${this.heightClass} ${this.widthClass}`;
  }
}
