import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-user-create-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-create-modal.component.html',
  styleUrl: './user-create-modal.component.scss',
})
export class UserCreateModalComponent {
  @Output() saved = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<boolean>();
  @Input() open!: boolean;

  currentStep = 1;

  formStep1: FormGroup;
  formStep2: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.formStep1 = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      address: [''],
    });

    this.formStep2 = this.fb.group({
      email: [{ value: '', disabled: true }], // Recebe valor da etapa 1
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  goToStep2() {
    if (this.formStep1.valid) {
      const email = this.formStep1.get('email')?.value;
      this.formStep2.get('email')?.setValue(email);
      this.currentStep = 2;
    } else {
      this.formStep1.markAllAsTouched();
    }
  }

  goToStep1() {
    this.currentStep = 1;
  }

  onSubmit() {
    if (this.formStep2.valid) {
      const fullData = {
        ...this.formStep1.value,
        password: this.formStep2.getRawValue().password,
      };

      const confPassword = this.formStep2.get('confirmPassword')?.value;
      console.log(`confPassword: ${confPassword}`);
      console.log(`password: `, fullData.password);

      if (fullData.password !== confPassword) {
        this.formStep2.get('confirmPassword')?.setErrors({ mismatch: true });
        this.formStep2.get('confirmPassword')?.markAsTouched();

        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'As senhas não coincidem.',
        });

        return;
      }

      // Se está tudo válido e senhas batem
      Swal.fire({
        title: 'Aguarde',
        text: 'Salvando usuário...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.authService.signUp(fullData).subscribe({
        next: (response) => {
          Swal.close();
          Swal.fire({
            title: 'Sucesso',
            text: 'Usuário criado com sucesso!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          this.saved.emit();
          this.close();
        },
        error: (err) => {
          Swal.close();
          console.error('Erro ao criar um usuário: ', err?.error?.message);
          Swal.fire({
            icon: 'error',
            title: 'Erro ao criar usuário',
            text: `Erro: ${err?.error?.message}`,
          });
        },
      });
    } else {
      this.formStep2.markAllAsTouched();

      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Preencha todos os campos obrigatórios corretamente.',
      });
    }
  }

  close() {
    this.onClose.emit(false);
    this.formStep1.reset();
    this.formStep2.reset();
    this.currentStep = 1;
  }
}
