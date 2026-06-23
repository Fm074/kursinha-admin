import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  NgZone,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MenuHelper } from './common/menu/menu.helper';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { FlowbiteService } from '../services/flowbite.service';
import { userRole, userService } from '../services/user.service';
import { AuthService } from '../modules/auth/services/auth.service';
import { SharedModule } from './shared/shared.module';
import { User } from '../interfaces/users';
import Swal from 'sweetalert2';
// import * from "@angular"

type themeOptions = 'light' | 'dark' | 'auto';

interface userRoleOptions {
  value: userRole;
  label: string;
}

@Component({
  selector: 'app-layout',
  imports: [RouterLink, CommonModule, RouterOutlet, SharedModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  @ViewChild('dropdownTheme') dropdownThemeRef!: ElementRef;
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);

  isLoadingMenuItems: boolean = false;

  options: userRoleOptions[] = [
    { value: 'PRODUCER', label: 'Produtor' },
    // { value: 'AFFILIATE', label: 'Afiliado' },
    { value: 'BUYER', label: 'Membro' },
    // { value: 'coprodutor', label: 'Coprodutor' }
  ];

  menuItems!: any[];

  selectedOptionUserRole = this.options[0];
  isOpenDropdownUserRole = false;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  dropdownOpen = false;

  user!: User;
  isAdmin: boolean = false;
  userStatus: string = '';

  profileImageUrl: string = '';
  private readonly STORAGE_KEY = 'profileImageUrl';

  dropdownThemeOpen = false;
  currentTheme: 'light' | 'dark' | 'auto' = 'auto';
  appliedTheme: 'light' | 'dark' = 'light';

  themeOptions = [
    { label: 'Claro', value: 'light' as themeOptions, icon: 'light_mode' },
    { label: 'Escuro', value: 'dark' as themeOptions, icon: 'dark_mode' },
    { label: 'Auto', value: 'auto' as themeOptions, icon: 'settings' },
  ];

  userCompliance: any;
  kycRequired: any;

  constructor(
    private flowbiteService: FlowbiteService,
    private userService: userService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.me().subscribe((user) => {
      this.user = user;
      this.userStatus = user.status;
      this.isAdmin = user.role === 'ADMIN';
      this.loadMenuItems(user.role);
      this.selectedOptionUserRole =
        this.options.find((option) => option.value === user.role) ||
        this.options[0];
    });

    this.userService.getComplianceStatus().subscribe({
      next: (response: any) => {
        this.userCompliance = response.data;
        this.kycRequired = this.checkKycRequired(this.userCompliance);
      },
    });

    this.loadProfilePhoto();
  }

  toggleDropdownSidebar(item: any) {
    item.open = !item.open;
  }

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });

    const savedTheme = localStorage.getItem('theme') as themeOptions;
    this.setTheme(savedTheme || 'auto');

    // 🔁 Escuta mudanças do sistema (apenas no modo auto)
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (this.currentTheme === 'auto') {
          this.appliedTheme = e.matches ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', e.matches);
          this.cdr.detectChanges();
        }
      });
  }

  private checkKycRequired(status: any) {
    if (!status) return false;
    const kycStatus = (status.kyc_status || '').toString().toUpperCase();
    const payoutStatus = (status.payout_status || '').toString().toUpperCase();
    const salesCount = Number(status.sales_count) || 0;

    return (
      salesCount >= 1 &&
      kycStatus === 'NOT_REQUESTED' &&
      payoutStatus === 'LOCKED'
    );
  }

  get showComplianceAlert(): boolean {
    if (!this.userCompliance) return false;

    const status = this.userCompliance.profile_status;

    return (
      status === 'INCOMPLETE' ||
      (this.kycRequired && status === 'BASIC_COMPLETED')
    );
  }

  ngAfterViewInit(): void {
    // Só roda no navegador
    if (typeof window !== 'undefined') {
      this.ngZone.runOutsideAngular(() => {
        this.renderer.listen('document', 'click', (event: MouseEvent) => {
          const clickedInside = this.dropdownRef.nativeElement.contains(
            event.target
          );
          if (!clickedInside) {
            this.ngZone.run(() => {
              this.dropdownOpen = false;
            });
          }
        });
      });
    }
  }

  toggleDropdownUserOptions(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleDropdownUserRole() {
    this.isOpenDropdownUserRole = !this.isOpenDropdownUserRole;
  }

  selectOptionUserRole(option: any) {
    this.selectedOptionUserRole = option;

    this.isLoadingMenuItems = true;

    this.loadMenuItems(this.selectedOptionUserRole.value);

    this.userService
      .updateUserRole(
        this.user?.id as string,
        this.selectedOptionUserRole.value
      )
      .subscribe({
        next: (response) => {
          console.log('User role updated successfully:', response);
          this.isLoadingMenuItems = false;
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.isLoadingMenuItems = false;
        },
      });

    this.isOpenDropdownUserRole = false;
  }

  loadMenuItems(userRole: userRole) {
    switch (userRole) {
      case 'ADMIN':
        this.menuItems = MenuHelper.adminMenu();
        break;

      // case 'COPRODUCER':
      //   this.menuItems = MenuHelper.coproducerMenu();
      //   break;
    }
  }

  loadProfilePhoto() {
    const savedPhoto = localStorage.getItem(this.STORAGE_KEY);
    if (savedPhoto) {
      this.profileImageUrl = savedPhoto;
    }
  }

  toggleDropdownTheme() {
    this.dropdownThemeOpen = !this.dropdownThemeOpen;
  }

  setTheme(theme: 'light' | 'dark' | 'auto') {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
    this.dropdownThemeOpen = false;
  }

  applyTheme(theme: 'light' | 'dark' | 'auto') {
    const root = document.documentElement;

    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.appliedTheme = isDark ? 'dark' : 'light';
      root.classList.toggle('dark', isDark);
    } else {
      this.appliedTheme = theme;
      root.classList.toggle('dark', theme === 'dark');
    }

    this.cdr.detectChanges();
  }

  getIcon(): string {
    if (this.currentTheme === 'auto') {
      return this.appliedTheme === 'dark' ? 'dark_mode' : 'light_mode';
    }
    return this.currentTheme === 'dark' ? 'dark_mode' : 'light_mode';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.dropdownThemeRef &&
      !this.dropdownThemeRef.nativeElement.contains(event.target)
    ) {
      this.dropdownThemeOpen = false;
    }
  }

  async onClickMenu(event: Event, item: any, action?: 'toggle') {
    // Se bloqueado, impede ação e mostra Swal
    if (item.lock) {
      event.preventDefault();
      event.stopPropagation();

      const focusedEl = document.activeElement as HTMLElement | null;

      await Swal.fire({
        title: 'Em breve',
        text: 'Essa funcionalidade ainda não está disponível.',
        icon: 'info',
        confirmButtonText: 'Entendi',
        returnFocus: false, // evita voltar foco pro botão
      });

      // remove foco do trigger e sobe página
      focusedEl?.blur();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Se for dropdown e não estiver bloqueado, apenas alterna
    if (action === 'toggle') {
      event.preventDefault();
      event.stopPropagation();
      this.toggleDropdownSidebar(item);
    }
  }
}
