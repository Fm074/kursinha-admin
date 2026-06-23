import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedModule } from '../../../layout/shared/shared.module';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  isLoading = false;
  private token: string | null = null;

  constructor(
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  confirmForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      Swal.fire({
        title: 'Link inválido',
        text: 'Reabra o link enviado ao seu e-mail.',
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#00F4FC',
      }).then(() => this.router.navigate(['/auth/forgot-password']));
    }
  }

  passwordsMatch(): boolean {
    const p = this.confirmForm.get('password')?.value || '';
    const c = this.confirmForm.get('confirmPassword')?.value || '';
    return !!p && !!c && p === c;
  }

  onConfirmReset(): void {
    if (!this.token) return;
    if (this.confirmForm.invalid || !this.passwordsMatch()) {
      Swal.fire({
        title: 'Senhas não conferem',
        text: 'As senhas devem ser iguais e ter ao menos 6 caracteres.',
        icon: 'error',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#00F4FC',
      });
      return;
    }

    this.isLoading = true;

    this.authService
      .passwordResetConfirm({
        token: this.token,
        newPassword: this.confirmForm.get('password')!.value as string,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire({
            title: 'Senha alterada com sucesso!',
            text: 'Agora você já pode acessar sua conta com a nova senha.',
            icon: 'success',
            confirmButtonText: 'Ir para login',
            confirmButtonColor: '#00F4FC',
          }).then(() => this.router.navigate(['/auth/sign-in']));
        },
        error: (error) => {
          this.isLoading = false;
          const status = error?.status;
          const message = (error?.error?.message || '').toLowerCase();

          if (status === 401 && message.includes('token já foi utilizado')) {
            Swal.fire({
              title: 'Token já utilizado',
              text: 'Este link já foi utilizado. Solicite um novo link de recuperação de senha.',
              icon: 'warning',
              confirmButtonText: 'Solicitar novo link',
              confirmButtonColor: '#00F4FC',
            }).then(() => this.router.navigate(['/auth/forgot-password']));
          } else if (
            status === 401 &&
            (message.includes('expirado') || message.includes('inválido'))
          ) {
            Swal.fire({
              title: 'Link inválido ou expirado',
              text: 'O link de redefinição não é mais válido. Solicite um novo link.',
              icon: 'warning',
              confirmButtonText: 'Solicitar novo link',
              confirmButtonColor: '#00F4FC',
            }).then(() => this.router.navigate(['/auth/forgot-password']));
          } else {
            Swal.fire({
              title: 'Erro ao alterar a senha',
              text: 'Não foi possível concluir a alteração agora. Tente novamente em instantes.',
              icon: 'error',
              confirmButtonText: 'Ok',
              confirmButtonColor: '#00F4FC',
            });
          }
        },
      });
  }
}
