import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgxMaskDirective } from 'ngx-mask';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-sign-up',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxMaskDirective,
    CommonModule,
    NgxSonnerToaster,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  form = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    password: new FormControl(''),
    confPassword: new FormControl(''),
  });
  isInserted: boolean = false;
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const email = this.form.get('email')?.value as string;
    const name = this.form.get('name')?.value as string;
    const password = this.form.get('password')?.value as string;
    const phone = this.form.get('phone')?.value as string | number;
    const confPassword = this.form.get('confPassword')?.value;

    // Validações básicas
    if (!email || !name || !password || !phone || !confPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios!',
        text: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Email inválido!',
        text: 'Por favor, insira um email válido.',
      });
      return;
    }

    // Validação de telefone (opcionalmente apenas números e mínimo de dígitos)
    if (isNaN(Number(phone)) || phone.toString().length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Telefone inválido!',
        text: 'Por favor, insira um número de telefone válido.',
      });
      return;
    }

    // Verificar se as senhas coincidem
    if (password !== confPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Senhas não coincidem!',
        text: 'As senhas devem ser iguais.',
      });
      return;
    }

    this.isLoading = true;
    // Enviar dados para a API
    this.authService
      .signUp({
        email,
        name,
        password,
        role: 'PRODUCER',
        phone: phone.toString(),
      })
      .subscribe(
        (response) => {
          if (response.status === 201) {
            this.isInserted = !this.isInserted;

            toast('Sua conta está pendente de aprovação');

            // this.authService
            //   .signIn({
            //     email,
            //     password,
            //   })
            //   .subscribe(
            //     (response) => {
            //       if (response.status === 200) {
            //         this.router.navigate(['/dashboard']);
            //       } else if (response.status === 401) {
            //         Swal.fire({
            //           icon: 'error',
            //           title: 'Credencias inválidas!',
            //           text: 'Por favor, Verifique as informações e tente novamente.',
            //         });
            //       }
            //     },
            //     (error) => {
            //       console.log('error: ', error);
            //       if (error.status === 401) {
            //         Swal.fire({
            //           icon: 'error',
            //           title: 'Credencias inválidas!',
            //           text: 'Por favor, Verifique as informações e tente novamente.',
            //         });
            //       } else {
            //         Swal.fire({
            //           icon: 'error',
            //           title: 'Erro desconhecido!',
            //           text: 'Não foi possível completar o login.',
            //         });
            //       }
            //     }
            //   );
          } else {
            // this.isError = true;
            Swal.fire({
              icon: 'error',
              title: 'Erro!',
              text: 'Algo deu errado ao cadastrar. Tente novamente.',
            });
          }
          this.isLoading = false;
        },
        (error) => {
          console.log('Erro ao cadastrar: ', error);
          // this.isError = true;
          Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: `${error?.error?.error?.message || "Não foi possível completar o cadastro."}`,
          });
          this.isLoading = false;
        }
      );
  }
}
