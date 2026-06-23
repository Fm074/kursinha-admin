import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-detail-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './user-detail-modal.component.html',
    styleUrl: './user-detail-modal.component.scss'
})
export class UserDetailModalComponent {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  @Output() approved = new EventEmitter<any>();
  @Output() rejected = new EventEmitter<any>();

  approve() {
    this.approved.emit(this.user);
    this.close.emit();
  }

  reject() {
    this.rejected.emit(this.user);
    this.close.emit();
  }
}
