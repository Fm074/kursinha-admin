import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map((user) => {
      if (user && user.role) {
        return true;
      }
      router.navigate(['/sign-in']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/sign-in']);
      return of(false);
    })
  );
};
