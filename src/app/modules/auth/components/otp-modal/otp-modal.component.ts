import {
  Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-modal.component.html'
})
export class OtpModalComponent {
  @Input() isOpen = false;
  @Input() email = '';
  @Input() isLoading = false;
  @Input() serverError = '';

  @Output() closed = new EventEmitter<void>();
  @Output() verify = new EventEmitter<string>();
  @Output() resend = new EventEmitter<void>();

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly length = 6;
  values: string[] = Array(this.length).fill('');
  countdown = 60;
  private timer?: any;

  get code() { return this.values.join(''); }
  get canSubmit() { return this.values.every(v => v.length === 1); }
  get emailMasked(): string {
    if (!this.email) return '';
    const [u, d] = this.email.split('@');
    const masked = u.length <= 3 ? u[0] + '***' : u.slice(0,2) + '***' + u.slice(-1);
    return `${masked}@${d}`;
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.startTimer();
      queueMicrotask(() => this.focusIndex(0));
    } else {
      this.stopTimer();
      this.values = Array(this.length).fill('');
    }
  }
  ngOnDestroy() { this.stopTimer(); }

  close() { this.closed.emit(); }

  submit() {
    if (!this.canSubmit || this.isLoading) return;
    this.verify.emit(this.code);
  }

  onResend() {
    if (this.countdown > 0) return;
    this.values = Array(this.length).fill('');
    this.resend.emit();
    this.startTimer();
    queueMicrotask(() => this.focusIndex(0));
  }

  // ===== inputs =====
  onInput(e: Event, i: number) {
    const el = e.target as HTMLInputElement;
    const val = (el.value || '').replace(/\D/g, '');
    if (!val) { this.values[i] = ''; return; }

    if (val.length > 1) { this.applyPasted(val, i); return; }

    this.values[i] = val; // ⚠️ não mover foco aqui (evita duplicação)
  }

  onKeyup(e: KeyboardEvent, i: number) {
    const el = e.target as HTMLInputElement;
    if (el.value && i < this.length - 1) this.focusIndex(i + 1);
  }

  onKeydown(e: KeyboardEvent, i: number) {
    const el = e.target as HTMLInputElement;
    if (e.key === 'Backspace') {
      if (!el.value && i > 0) {
        this.values[i - 1] = '';
        this.focusIndex(i - 1);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) this.focusIndex(i - 1);
    if (e.key === 'ArrowRight' && i < this.length - 1) this.focusIndex(i + 1);
  }

  onPaste(ev: ClipboardEvent, i: number) {
    const data = ev.clipboardData?.getData('text') ?? '';
    const digits = data.replace(/\D/g, '');
    if (!digits) return;
    ev.preventDefault();
    this.applyPasted(digits, i);
  }

  private applyPasted(d: string, i: number) {
    const arr = d.slice(0, this.length - i).split('');
    arr.forEach((ch, idx) => this.values[i + idx] = ch);
    const last = Math.min(i + arr.length - 1, this.length - 1);
    this.focusIndex(last < this.length - 1 ? last + 1 : last);
  }

  private focusIndex(i: number) {
    const el = this.inputs?.get(i)?.nativeElement;
    if (el) { el.focus(); el.select(); }
  }

  // ===== timer =====
  private startTimer() {
    this.stopTimer();
    this.countdown = 60;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) this.stopTimer();
    }, 1000);
  }
  private stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = undefined; }
  }
}
