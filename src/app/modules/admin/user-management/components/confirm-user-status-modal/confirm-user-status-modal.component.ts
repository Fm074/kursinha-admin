import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../../../interfaces/users';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-user-status-modal',
  templateUrl: './confirm-user-status-modal.component.html',
  styleUrls: ['./confirm-user-status-modal.component.scss'],
  imports: [CommonModule]
})
export class ConfirmUserStatusModalComponent {
  @Input() open: boolean = false;
  @Input() title: string = 'Confirmar ação';
  @Input() message: string = 'Tem certeza que deseja realizar esta ação?';
  @Input() confirmButtonText: string = 'Confirmar';
  @Input() confirmButtonColor: string = 'blue';
  @Input() user!: User | null;
  
  @Output() confirmed = new EventEmitter<User>();
  @Output() closed = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit(this.user as User);
  }

  onCancel() {
    this.closed.emit();
  }
}