import { Component } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { OtpModalComponent } from '../components/otp-modal/otp-modal.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    OtpModalComponent,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  isLoading = false;

  // ===== OTP =====
  showOtp = false;
  otpError = '';
  otpid: string | null = null;
  emailForOtp = '';

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ======================
  // Helpers de redirecionamento
  // ======================

  private getRedirectUrl(): string | null {
    const redirectRaw = this.route.snapshot.queryParamMap.get('redirect');
    if (!redirectRaw) return null;

    // segurança: só permitir rotas internas
    return redirectRaw.startsWith('/') ? redirectRaw : null;
  }

  private getRoleFallback(role?: string): string {
    return role === 'ADMIN' ? '/dashboard-management' : '/dashboard';
  }

  private navigateAfterLogin(role?: string) {
    const redirect = this.getRedirectUrl();
    const fallback = this.getRoleFallback(role);
    this.router.navigateByUrl(redirect ?? fallback);
  }

  // ======================
  // Login
  // ======================

  onSubmit() {
    if (this.form.invalid) {
      if (this.form.get('email')?.hasError('required')) {
        Swal.fire('Erro', 'Por favor, insira seu email', 'error');
        return;
      }
      if (this.form.get('email')?.hasError('email')) {
        Swal.fire('Erro', 'Por favor, insira um email válido', 'error');
        return;
      }
      if (this.form.get('password')?.hasError('required')) {
        Swal.fire('Erro', 'Por favor, insira sua senha', 'error');
        return;
      }
      return;
    }

    const { email, password } = this.form.value;
    this.isLoading = true;
    this.otpError = '';
    this.emailForOtp = email as string;

    this.authService
      .signIn({ email: email as string, password: password as string })
      .subscribe({
        next: (response: any) => {
          // ===== CASO 1: login completo (sem OTP)
          if (response.body?.data) {
            const role = response.body?.data?.role;
            this.isLoading = false;
            this.navigateAfterLogin(role);
            return;
          }

          // ===== CASO 2: precisa de OTP
          if (response.body?.requiresOTP) {
            this.otpid =
              response.body?.otpId || response.headers.get('x-otpid') || null;

            this.isLoading = false;

            if (this.otpid) {
              this.openOtpModal();
            } else {
              Swal.fire(
                'Erro',
                'Não foi possível iniciar a validação OTP.',
                'error'
              );
            }
            return;
          }

          this.isLoading = false;
        },

        error: (error: any) => {
          this.isLoading = false;

          // ===== OTP exigido via erro 401
          if (
            error?.status === 401 &&
            (error?.error?.reason === 'OTP_REQUIRED' || error?.error?.otpid)
          ) {
            this.otpid = error?.error?.otpid ?? null;
            if (this.otpid) {
              this.openOtpModal();
            }
            return;
          }

          // ===== Credenciais inválidas
          if (error?.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'Credenciais inválidas!',
              text: 'Por favor, verifique as informações e tente novamente.',
            });
            return;
          }

          // ===== Erro genérico
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: error?.error?.message || 'Não foi possível completar o login',
          });
        },
      });
  }

  // ======================
  // OTP
  // ======================

  private openOtpModal() {
    this.showOtp = true;
    this.otpError = '';
  }

  onOtpClosed() {
    this.showOtp = false;
    this.otpid = null;
  }

  onOtpVerify(code: string) {
    if (!this.otpid) return;

    this.isLoading = true;
    this.otpError = '';

    this.authService.verifyOTP(this.otpid, code).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showOtp = false;

        const role = res?.data?.role || 'USER';
        this.navigateAfterLogin(role);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.otpError = err?.error?.message || 'Código inválido ou expirado.';
      },
    });
  }
}
