import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { User } from '../../../../../interfaces/users';
import Swal from 'sweetalert2';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-user-edit-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-edit-modal.component.html',
  styleUrl: './user-edit-modal.component.scss',
})
export class UserEditModalComponent implements OnChanges {
  @Output() updated = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<boolean>();
  @Input() open!: boolean;
  @Input() userData!: User | null; // Recebe os dados do usuário a ser editado

  currentStep = 1;

  formStep1: FormGroup;
  formStep2: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserManagementService
  ) {
    this.formStep1 = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      address: [''],
    });

    this.formStep2 = this.fb.group({
      email: [{ value: '', disabled: true }],
      password: [''],
      confirmPassword: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData'] && this.userData) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    console.log(`user: `, this.userData);
    this.formStep1.patchValue({
      name: this.userData?.name,
      email: this.userData?.email,
      phone: this.userData?.phone,
      role: this.userData?.role,
      address: this.userData?.address,
    });

    this.formStep2.patchValue({
      email: this.userData?.email,
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
    if (this.formStep1.valid) {
      const formData = {
        ...this.formStep1.value,
        id: this?.userData?.id, // Mantém o ID do usuário
      };

      // Verifica se há senha para atualizar
      const password = this.formStep2.get('password')?.value;
      const confirmPassword = this.formStep2.get('confirmPassword')?.value;

      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          this.formStep2.get('confirmPassword')?.setErrors({ mismatch: true });
          this.formStep2.get('confirmPassword')?.markAsTouched();

          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'As senhas não coincidem.',
          });
          return;
        }

        // Se as senhas coincidem, adiciona ao objeto
        formData.password = password;
      }

      Swal.fire({
        title: 'Aguarde',
        text: 'Atualizando usuário...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.userService
        .updateUser(this.userData?.id as string, {
          // status: this.userData?.status || 'ACTIVE',
          role: this.formStep1.get('role')?.value,
          name: this.formStep1.get('name')?.value,
        })
        .subscribe({
          next: (response: any) => {
            Swal.close();
            Swal.fire({
              title: 'Sucesso',
              text: 'Usuário atualizado com sucesso!',
              icon: 'success',
              confirmButtonText: 'OK',
            });
            this.updated.emit();
            this.close();
          },
          error: (err: any) => {
            Swal.close();
            console.error('Erro ao atualizar usuário: ', err?.error?.message);
            Swal.fire({
              icon: 'error',
              title: 'Erro ao atualizar usuário',
              text: `Erro: ${err?.error?.message}`,
            });
          },
        });
    } else {
      this.formStep1.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Preencha todos os campos obrigatórios corretamente.',
      });
    }
  }

  close() {
    this.onClose.emit(false);
    this.currentStep = 1;
  }
}
