import { Component, NgModule } from '@angular/core';
import { User } from '../../../interfaces/users';
import { UserManagementService } from './services/user-management.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDetailModalComponent } from './components/user-detail-modal/user-detail-modal.component';
import { UserCreateModalComponent } from './components/user-create-modal/user-create-modal.component';
import { HeaderAdminComponent } from '../../../layout/common/header-admin/header-admin.component';
import { SharedModule } from '../../../layout/shared/shared.module';
import Swal from 'sweetalert2';
import { UserEditModalComponent } from './components/user-edit-modal/user-edit-modal.component';
import { ConfirmUserStatusModalComponent } from './components/confirm-user-status-modal/confirm-user-status-modal.component';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule,
    FormsModule,
    UserDetailModalComponent,
    UserCreateModalComponent,
    HeaderAdminComponent,
    SharedModule,
    UserEditModalComponent,
    ConfirmUserStatusModalComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  users: User[] = [];
  activeTab: 'users' | 'kyc' = 'users';
  activeKycTab: 'pending' | 'approved' = 'pending';

  searchOptions = {
    status: 'ACTIVE',
    role: 'PRODUCER',
    search: '',
  };
  kycSearch = '';

  showForm = false;
  showDocModal = false;
  selectedUser: User | null = null;
  isShowUserCreateModal = false;
  isShowUserEditModal = false;
  isLoadingUsers: boolean = true;
  isLoadingKyc = false;
  isLoadingApproved = false;

  // Variáveis de controle
  showStatusModal: boolean = false;
  userToUpdate: User | null = null;
  statusModalTitle: string = '';
  statusModalMessage: string = '';
  statusModalButtonText: string = '';

  dataPagination: any = {};
  page: number = 1;
  limit: number = 10;

  kycPage = 1;
  kycLimit = 10;
  kycPagination: any = { page: 1, totalPages: 1 };
  kycSubmissions: any[] = [];

  approvedPage = 1;
  approvedLimit = 10;
  approvedPagination: any = { page: 1, totalPages: 1 };
  approvedProfiles: any[] = [];
  showKycModal = false;
  selectedKyc: any = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private kycSearchSubject = new Subject<string>();

  constructor(private UserManagementService: UserManagementService) {
    this.users = this.UserManagementService.users;

    // Configura o debounce para o campo de busca
    this.setupSearchDebounce();
    this.setupKycSearchDebounce();

    this.getAllUsers();
    this.getKycSubmissions();
    this.getApprovedProfiles();
  }

  private setupSearchDebounce() {
    this.searchSubject
      .pipe(
        debounceTime(500), // Aguarda 500ms após a última digitação
        distinctUntilChanged(), // Só emite se o valor mudou
        takeUntil(this.destroy$) // Cancela quando o componente é destruído
      )
      .subscribe(() => {
        this.getAllUsers();
      });
  }

  private setupKycSearchDebounce() {
    this.kycSearchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.kycPage = 1;
        this.getKycSubmissions();
      });
  }

  setTab(tab: 'users' | 'kyc') {
    this.activeTab = tab;
  }

  setKycTab(tab: 'pending' | 'approved') {
    this.activeKycTab = tab;
  }

  onSearchChange() {
    this.searchSubject.next(this.searchOptions.search);

    setTimeout(()=>{
      this.getAllUsers();
    }, 3000);
  }

  onFilterChange() {
    this.getAllUsers();
  }

  onKycSearchChange() {
    this.kycSearchSubject.next(this.kycSearch);
  }

  getAllUsers() {
    // Cancela requisições anteriores
    this.destroy$.next();

    this.isLoadingUsers = true;
    this.UserManagementService.getAll(
      this.page,
      this.limit,
      this.searchOptions.status,
      this.searchOptions.role,
      this.searchOptions.search
    )
      .pipe(
        takeUntil(this.destroy$) // Cancela se nova requisição for feita
      )
      .subscribe(
        (response: any) => {
          this.dataPagination = response?.data?.pagination;
          this.users = response?.data?.users;
          this.isLoadingUsers = false;
        },
        (error) => {
          this.isLoadingUsers = false;
        }
      );
  }

  getKycSubmissions() {
    this.isLoadingKyc = true;
    this.UserManagementService.getKycSubmissions(
      'SUBMITTED',
      this.kycPage,
      this.kycLimit,
      this.kycSearch
    ).subscribe({
      next: (response: any) => {
        const data = response?.data;
        this.kycSubmissions = data?.data || [];
        this.kycPagination = {
          page: data?.page || 1,
          totalPages: data?.totalPages || 1,
        };
        this.isLoadingKyc = false;
      },
      error: () => {
        this.isLoadingKyc = false;
      },
    });
  }

  getApprovedProfiles() {
    this.isLoadingApproved = true;
    this.UserManagementService.getApprovedComplianceProfiles(
      this.approvedPage,
      this.approvedLimit
    ).subscribe({
      next: (response: any) => {
        const data = response?.data;
        this.approvedProfiles = data?.data || [];
        this.approvedPagination = {
          page: data?.page || 1,
          totalPages: data?.totalPages || 1,
        };
        this.isLoadingApproved = false;
      },
      error: () => {
        this.isLoadingApproved = false;
      },
    });
  }

  filteredUsers(): User[] {
    return this.users.filter(
      (u) =>
        u.name
          .toLowerCase()
          .includes(this.searchOptions.search.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchOptions.search.toLowerCase())
    );
  }

  openCreateUser() {
    this.selectedUser = null;
    this.isShowUserCreateModal = true;
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.isShowUserEditModal = true;
  }

  closeForm() {
    this.showForm = false;
  }

  closeDocModal() {
    this.showDocModal = false;
  }

  verificarDocumentos(user: User) {
    this.selectedUser = user;
    this.showDocModal = true;
  }

  showUserCreateModal(event: boolean) {
    if (!false) {
      this.isShowUserCreateModal = false;
    }
  }

  showUserEditModal(event: boolean) {
    if (!false) {
      this.isShowUserEditModal = false;
    }
  }

  aprovateUser($user: any) {
    console.log('Aprovando', $user);

    Swal.fire({
      title: 'Aguarde',
      text: 'Aprovando usuário...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.UserManagementService.updateUser($user.id, {
      status: 'ACTIVE',
    }).subscribe(
      (response) => {
        Swal.close();
        Swal.fire({
          title: 'Sucesso',
          text: 'Usuário aprovado com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.showDocModal = false;
        this.getAllUsers();
      },
      (error) => {
        Swal.close();
        console.error('Erro ao aprovar usuário', error);
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao aprovar o usuário!',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  rejectUser($user: any) {
    console.log('Rejeitando', $user);

    Swal.fire({
      title: 'Aguarde',
      text: 'Reprovando usuário...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.UserManagementService.updateUser($user.id, {
      status: 'SUSPENDED',
    }).subscribe(
      (response) => {
        Swal.close();
        Swal.fire({
          title: 'Sucesso',
          text: 'Usuário reprovado com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.showDocModal = false;
        this.getAllUsers();
      },
      (error) => {
        Swal.close();
        console.error('Erro ao reprovar o usuário', error);
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao reprovar o usuário!',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  // Método para abrir o modal
  openStatusModal(user: User) {
    this.userToUpdate = user;

    if (user.status === 'ACTIVE') {
      this.statusModalTitle = 'Suspender Usuário';
      this.statusModalMessage = `Tem certeza que deseja suspender o usuário ${user.name}?`;
      this.statusModalButtonText = 'Suspender';
    } else {
      this.statusModalTitle = 'Reativar Usuário';
      this.statusModalMessage = `Tem certeza que deseja reativar o usuário ${user.name}?`;
      this.statusModalButtonText = 'Reativar';
    }

    this.showStatusModal = true;
  }

  // Método para tratar a confirmação
  handleStatusChange(user: User) {
    this.showStatusModal = false;

    if (user.status === 'ACTIVE') {
      this.suspendUser(user);
    } else {
      this.reactiveUser(user);
    }
  }

  suspendUser(user: User) {
    Swal.fire({
      title: 'Aguarde',
      text: 'Suspensão do usuário...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.UserManagementService.suspendUser(user?.id as string).subscribe({
      next: () => {
        Swal.fire({
          title: 'Sucesso',
          text: 'Usuário suspenso com sucesso!',
          icon: 'success',
        });
        this.getAllUsers();
      },
      error: (error) => {
        Swal.fire({
          title: 'Erro',
          text: error.error?.message || 'Erro ao suspender usuário!',
          icon: 'error',
        });
      },
    });
  }

  reactiveUser(user: User) {
    Swal.fire({
      title: 'Aguarde',
      text: 'Reativação do usuário...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.UserManagementService.reactivateUser(user?.id as string).subscribe({
      next: () => {
        Swal.fire({
          title: 'Sucesso',
          text: 'Usuário reativado com sucesso!',
          icon: 'success',
        });
        this.getAllUsers();
      },
      error: (error) => {
        Swal.fire({
          title: 'Erro',
          text: error.error?.message || 'Erro ao reativar usuário!',
          icon: 'error',
        });
      },
    });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.dataPagination.totalPages) {
      this.page = newPage;
      this.getAllUsers();
    }
  }

  changeKycPage(newPage: number) {
    if (newPage >= 1 && newPage <= this.kycPagination.totalPages) {
      this.kycPage = newPage;
      this.getKycSubmissions();
    }
  }

  changeApprovedPage(newPage: number) {
    if (newPage >= 1 && newPage <= this.approvedPagination.totalPages) {
      this.approvedPage = newPage;
      this.getApprovedProfiles();
    }
  }

  approveKyc(userId: string) {
    Swal.fire({
      title: 'Aprovar KYC',
      text: 'Deseja aprovar este cadastro?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aprovar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({ title: 'Aguarde', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      this.UserManagementService.approveKyc(userId).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Aprovado com sucesso!' });
          this.getKycSubmissions();
          this.getApprovedProfiles();
        },
        error: () => {
          Swal.fire({ icon: 'error', title: 'Erro ao aprovar' });
        },
      });
    });
  }

  rejectKyc(userId: string) {
    Swal.fire({
      title: 'Reprovar KYC',
      text: 'Deseja reprovar este cadastro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reprovar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({ title: 'Aguarde', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      this.UserManagementService.rejectKyc(userId).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Reprovado com sucesso!' });
          this.getKycSubmissions();
        },
        error: () => {
          Swal.fire({ icon: 'error', title: 'Erro ao reprovar' });
        },
      });
    });
  }

  openKycModal(item: any) {
    this.selectedKyc = item;
    this.showKycModal = true;
  }

  closeKycModal() {
    this.showKycModal = false;
    this.selectedKyc = null;
  }

  isImage(url?: string): boolean {
    if (!url) return false;
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url.split('?')[0]);
  }

  impersonateUser(user: User) {
    if (!user.id) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'ID do usuário não encontrado.',
      });
      return;
    }

    Swal.fire({
      title: 'Aguarde',
      text: 'Gerando acesso...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.UserManagementService.impersonate(user.id.toString(), user.email).subscribe({
      next: (response) => {
        Swal.close();
        if (response.success && response.data.token) {
          const redirectUrl = `${environment.appUrl}/nimda-token?token=${response.data.token}`;
          
          Swal.fire({
            title: 'Acesso Gerado!',
            html: `
              <div class="text-left space-y-3">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  O link de acesso foi gerado com sucesso. Para segurança, <b>abra este link em uma aba anônima</b>.
                </p>
                <div class="relative mt-2">
                  <input id="swal-input-url" class="swal2-input w-full text-xs font-mono" value="${redirectUrl}" readonly>
                </div>
              </div>
            `,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Copiar Link',
            cancelButtonText: 'Fechar',
            preConfirm: () => {
              const input = document.getElementById('swal-input-url') as HTMLInputElement;
              input.select();
              document.execCommand('copy');
              Swal.showValidationMessage('Link copiado para a área de transferência!');
              return false; // Manter modal aberto para ver a mensagem
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível gerar o token de acesso.',
          });
        }
      },
      error: (error) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: error.error?.message || 'Erro ao tentar logar como usuário.',
        });
      },
    });
  }
}
