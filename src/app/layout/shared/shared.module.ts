import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../common/button/button.component';
import { LoadingSpinnerComponent } from '../common/loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [ButtonComponent, LoadingSpinnerComponent], // Declare o botão
  imports: [CommonModule],
  exports: [ButtonComponent, LoadingSpinnerComponent], // Exporte para que outros módulos possam usar
})
export class SharedModule {}