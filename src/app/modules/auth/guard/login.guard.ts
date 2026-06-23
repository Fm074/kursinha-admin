import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map((user) => {
      if (user) {
        if (user.role === 'ADMIN') {
          router.navigate(['/dashboard-management']);
        } else if (user.role === 'PRODUCER') {
          router.navigate(['/dashboard']); // rota do produtor
        } else {
          router.navigate(['/my-purchases']); // rota dos consumers
        }
        return false; // bloqueia login para quem já está autenticado
      }
      return true; // se não tem user → pode acessar login
    }),
    catchError(() => of(true)) // em erro → deixa acessar login
  );
};
