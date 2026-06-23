import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maintenance-notice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance-notice.component.html',
  styleUrls: ['./maintenance-notice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceNoticeComponent {
  @Output() acknowledged = new EventEmitter<void>();

  onAcknowledge() {
    this.acknowledged.emit();
  }
}
