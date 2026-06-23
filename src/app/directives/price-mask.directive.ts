import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

@Directive({
  selector: 'input[appPriceMask], textarea[appPriceMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PriceMaskDirective),
      multi: true,
    },
  ],
})
export class PriceMaskDirective implements ControlValueAccessor {
  /** Valor mínimo permitido (opcional) */
  @Input() minPrice: number | null = null;
  /** Valor máximo permitido (opcional) */
  @Input() maxPrice: number | null = null;
  /** Localidade para formatação */
  @Input() locale = 'pt-AO';
  /** Símbolo da moeda apenas para exibição externa, não é usado na digitação */
  @Input() currencySymbol = 'Kz';
  /** Permitir números negativos (default: false) */
  @Input() allowNegative = false;
  /** Classe aplicada quando inválido (ex.: borda vermelha Tailwind) */
  @Input() errorClass = 'ring-1 ring-red-500 border-red-500';

  private onChange: (v: number) => void = () => {};
  private onTouched: () => void = () => {};
  private disabled = false;
  private value = 0;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  // ====== Public helpers (opcional): validadores para usar no form ======
  static minPriceValidator(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = Number(control.value ?? 0);
      return v > 0 && v < min
        ? { minPrice: { requiredMin: min, actual: v } }
        : null;
    };
  }
  static maxPriceValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = Number(control.value ?? 0);
      return v > max ? { maxPrice: { requiredMax: max, actual: v } } : null;
    };
  }

  // ================= ControlValueAccessor =================
  writeValue(v: number | null): void {
    this.value = Number.isFinite(v as number) ? Number(v) : 0;
    this.render(this.value);
    this.flagErrorIfNeeded();
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.el.nativeElement.toggleAttribute('disabled', isDisabled);
  }

  // ================= Eventos do host =================
  @HostListener('focus')
  onFocus(): void {
    // Seleciona tudo para facilitar a edição
    queueMicrotask(() => this.el.nativeElement.select());
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    // Normaliza exibição ao sair
    this.render(this.value);
    this.flagErrorIfNeeded();
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: Event): void {
    if (this.disabled) return;

    const ev = event as KeyboardEvent;

    // Permite atalhos do sistema (Ctrl/Cmd + A/C/V/X/Z/Y etc.)
    if (ev.ctrlKey || ev.metaKey) return;

    const allowedControlKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Enter',
      ',',
      '.', // separador decimal do usuário
    ];

    const isDigit = /^[0-9]$/.test(ev.key);
    const isMinus = ev.key === '-' && this.allowNegative;
    const isAllowed = isDigit || allowedControlKeys.includes(ev.key) || isMinus;

    if (!isAllowed) {
      ev.preventDefault();
      return;
    }

    // Evita mais de um separador decimal visual
    if (
      (ev.key === ',' || ev.key === '.') &&
      (this.el.nativeElement.value.includes(',') ||
        this.el.nativeElement.value.includes('.'))
    ) {
      ev.preventDefault();
      return;
    }

    // Evita "-" fora do início ou duplicado
    if (isMinus) {
      const el = this.el.nativeElement;
      const pos = el.selectionStart ?? 0;
      if (pos !== 0 || el.value.includes('-')) {
        ev.preventDefault();
        return;
      }
    }
  }

  @HostListener('input', ['$event'])
  onInput(e: Event): void {
    if (this.disabled) return;
    const raw = (e.target as HTMLInputElement).value;
    const num = this.parse(raw);
    this.value = num;
    this.onChange(num);
    // Re-renderiza formatado conforme digita (máscara viva)
    this.render(num);
    this.flagErrorIfNeeded();
    // Mantém cursor ao final (solução simples e robusta)
    queueMicrotask(() => {
      const el = this.el.nativeElement;
      el.selectionStart = el.selectionEnd = el.value.length;
    });
  }

  @HostListener('paste', ['$event'])
  onPaste(event: Event): void {
    if (this.disabled) return;
    event.preventDefault();

    // Narrowing seguro para ClipboardEvent
    const e = event as ClipboardEvent;
    const text = (e.clipboardData?.getData('text') ?? '').toString();

    const num = this.parse(text);
    this.value = num;
    this.onChange(num);
    this.render(num);
    this.flagErrorIfNeeded();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: Event): void {
    if (this.disabled) return;
    event.preventDefault();

    // Narrowing seguro para DragEvent (se você for usar dataTransfer futuramente)
    const e = event as DragEvent;
    // const text = e.dataTransfer?.getData('text') ?? '';
    // ...
  }

  // ================== Parse/Format ==================
  private nf = new Intl.NumberFormat(this.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /** Converte qualquer entrada do usuário em número com 2 casas (centavos) */
  private parse(input: string): number {
    if (!input) return 0;

    // Mantém sinal se permitido
    const negative = this.allowNegative && input.trim().startsWith('-');

    // Mantém somente dígitos
    const digits = input.replace(/\D/g, '');
    if (!digits) return 0;

    // Divide por 100 para criar 2 casas
    const num = Number(digits) / 100;
    return negative ? -num : num;
  }

  /** Formata número para string '12.345,67' respeitando locale */
  private format(value: number): string {
    if (!Number.isFinite(value)) return '0,00';
    return this.nf.format(value);
  }

  private render(value: number): void {
    this.el.nativeElement.value = this.format(value);
  }

  // ================== Erro visual mínimo/máximo ==================
  private flagErrorIfNeeded(): void {
    const el = this.el.nativeElement;
    // Limpa estado
    el.removeAttribute('aria-invalid');
    this.removeErrorClass();

    const v = Number(this.value);
    const isMinInvalid =
      this.minPrice != null && v > 0 && v < (this.minPrice as number);
    const isMaxInvalid = this.maxPrice != null && v > (this.maxPrice as number);

    if (isMinInvalid || isMaxInvalid) {
      el.setAttribute('aria-invalid', 'true');
      this.addErrorClass();
    }
  }
  private addErrorClass(): void {
    if (!this.errorClass) return;
    this.errorClass
      .split(' ')
      .forEach((c) => this.el.nativeElement.classList.add(c));
  }
  private removeErrorClass(): void {
    if (!this.errorClass) return;
    this.errorClass
      .split(' ')
      .forEach((c) => this.el.nativeElement.classList.remove(c));
  }
}

/**
 * <input appPriceMask [(ngModel)]="price" name="price" class="border rounded px-3 py-2" [minPrice]="1000" />
2

 <form [formGroup]="fg" class="space-y-2">
    <label class="block text-sm font-medium">Preço</label>
    <input
      appPriceMask
      [minPrice]="1000"
      [maxPrice]="1000000"
      [locale]="'pt-AO'"
      [errorClass]="'ring-1 ring-red-500 border-red-500'"
      formControlName="price"
      class="w-full px-4 py-2 border rounded-lg"
      inputmode="decimal"
      autocomplete="off"
      placeholder="0,00 Kz"
    />

    <p class="text-xs text-red-600" *ngIf="fg.get('price')?.hasError('minPrice')">
      O preço mínimo é {{ fg.get('price')?.getError('minPrice')?.requiredMin | number:'1.0-2' }} Kz
    </p>
    <p class="text-xs text-red-600" *ngIf="fg.get('price')?.hasError('maxPrice')">
      O preço máximo é {{ fg.get('price')?.getError('maxPrice')?.requiredMax | number:'1.0-2' }} Kz
    </p>

    <div class="text-sm text-gray-600">
      Valor (model): {{ fg.value.price }}
    </div>

    ts:
      fg = this.fb.group({
    price: [0, [
      PriceMaskDirective.minPriceValidator(1000),
      PriceMaskDirective.maxPriceValidator(1_000_000),
    ]],
  });
 */