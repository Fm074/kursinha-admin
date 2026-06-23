import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { ProfileService } from './services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: any;
  @ViewChild('fileInput') fileInput!: ElementRef;

  profileImageUrl: string | null = null;
  loading = false;
  error: string | null = null;
  savingProfile = false;
  saveError: string | null = null;
  saveSuccess: string | null = null;

  profileData = {
    name: '',
    email: '',
    phone: '',
    address: '',
  };

  private readonly STORAGE_KEY = 'profileImageUrl';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.authService.me().subscribe((response) => {
      this.user = response;
      this.profileData = {
        name: response?.name || '',
        email: response?.email || '',
        phone: response?.phone || '',
        address: response?.address || '',
      };
      this.loadProfilePhoto();
    });
  }

  ngOnInit() {}

  // Carrega a foto do localStorage
  loadProfilePhoto() {
    const savedPhoto = localStorage.getItem(this.STORAGE_KEY);
    if (savedPhoto) {
      this.profileImageUrl = savedPhoto;
    }
  }

   // Quando um arquivo é selecionado
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validações básicas
    if (!file.type.match('image.*')) {
      this.error = 'Por favor, selecione um arquivo de imagem válido';
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB (reduzido para localStorage)
      this.error = 'A imagem deve ter menos de 2MB';
      return;
    }

    this.uploadPhoto(file);
  }


  // Método para enviar a foto
  uploadPhoto(file: File) {
    this.loading = true;
    this.error = null;

    this.profileService.uploadProfilePhoto(file).subscribe({
      next: (response: any) => {
        this.profileImageUrl = response.data.photoUrl;

         localStorage.setItem(this.STORAGE_KEY, this.profileImageUrl as string);

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao enviar foto. Por favor, tente novamente.';
        this.loading = false;
      },
    });
  }

  saveProfile() {
    if (!this.user?.id) {
      this.saveError = 'Nao foi possivel identificar o usuario.';
      return;
    }

    this.savingProfile = true;
    this.saveError = null;
    this.saveSuccess = null;

    const payload = {
      name: this.profileData.name,
      email: this.profileData.email,
      phone: this.profileData.phone,
      address: this.profileData.address,
    };

    this.profileService.updateProfile(this.user.id, payload).subscribe({
      next: () => {
        this.savingProfile = false;
        this.saveSuccess = 'Dados atualizados com sucesso.';
        this.user = { ...this.user, ...payload };
      },
      error: () => {
        this.savingProfile = false;
        this.saveError = 'Erro ao salvar dados. Tente novamente.';
      },
    });
  }

  removePhoto() {
    if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) return;

    localStorage.removeItem(this.STORAGE_KEY);
    this.profileImageUrl = null;
    
    // Aqui você pode chamar um endpoint para remover no servidor se existir
    // this.profileService.removeProfilePhoto().subscribe(...);
  }

  // Método para remover a foto
  // removePhoto() {
  //   this.loading = true;

  //   this.profileService.removeProfilePhoto().subscribe({
  //     next: () => {
  //       this.profileImageUrl = null;
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       this.error = 'Erro ao remover foto. Por favor, tente novamente.';
  //       this.loading = false;
  //     },
  //   });
  // }

  // // Método para carregar a foto atual
  // loadProfilePhoto() {
  //   this.loading = true;

  //   this.profileService.getProfilePhoto().subscribe({
  //     next: (response: any) => {
  //       this.profileImageUrl = response.data.photoUrl;
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       this.error = 'Erro ao carregar foto.';
  //       this.loading = false;
  //     }
  //   });
  // }
}
