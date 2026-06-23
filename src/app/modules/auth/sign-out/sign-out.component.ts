import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-out',
  imports: [],
  templateUrl: './sign-out.component.html',
  styleUrl: './sign-out.component.scss',
})
export class SignOutComponent {
  constructor(private authService: AuthService) {
    this.authService.signOut().subscribe({
      next: () => {
        console.log('Usuário desconectado com sucesso.');
        localStorage.removeItem('user');
        //Redirecionar ou realizar outras ações após o logout
        window.location.href = '/sign-in';
      },
      error: (error) => {
        console.error('Erro ao desconectar:', error);
        // Tratar erro de desconexão, se necessário
        // window.location.href = '/sign-in';
      },
    });
  }
}
