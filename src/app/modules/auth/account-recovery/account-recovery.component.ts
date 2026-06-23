import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { userService } from '../../../services/user.service';
import { AuthService } from '../services/auth.service';
import { SharedModule } from '../../../layout/shared/shared.module';

@Component({
  selector: 'app-account-recovery',
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, SharedModule],
  templateUrl: './account-recovery.component.html',
  styleUrl: './account-recovery.component.scss',
})
export class AccountRecoveryComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.email]),
  });
  isLoadingButton = false;

  constructor(public fb: FormBuilder, public authService: AuthService) {}

  ngOnInit(): void {}

  onSubmit() {
    if (this.form.invalid) {
      Swal.fire({
        title: 'E-mail inválido',
        text: 'Por favor, insira um endereço de e-mail válido para continuar.',
        icon: 'error',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#00F4FC',
      });

      return;
    }

    this.isLoadingButton = true;
    this.authService
      .passwordResetRequest(this.form.get('email')?.value as string)
      .subscribe({
        next: (response) => {
          // console.log('response:', response);
          this.isLoadingButton = false;

          Swal.fire({
            title: 'E-mail enviado!',
            text: 'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
            icon: 'success',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#00F4FC',
          });
        },
        error: (error) => {
          // console.log('error:', error);
          this.isLoadingButton = false;

          const errorMessage = error?.error?.error?.message || '';

          // Caso o e-mail não exista na plataforma
          if (errorMessage.toLowerCase().includes('não encontrado')) {
            Swal.fire({
              title: 'E-mail não encontrado',
              text: 'Não encontramos nenhuma conta associada a este e-mail. Verifique e tente novamente.',
              icon: 'warning',
              confirmButtonText: 'Tentar novamente',
              confirmButtonColor: '#00F4FC',
            });
          }
          // Caso ocorra qualquer outro erro
          else {
            Swal.fire({
              title: 'Erro inesperado',
              text: 'Ocorreu um erro ao processar sua solicitação. Tente novamente em alguns instantes.',
              icon: 'error',
              confirmButtonText: 'Ok',
              confirmButtonColor: '#00F4FC',
            });
          }
        },
      });
  }
}
