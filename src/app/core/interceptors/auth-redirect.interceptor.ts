import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];

function isAuthRoute(url: string): boolean {
  return AUTH_ROUTES.some((r) => url.startsWith(r));
}

export const authRedirectInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Opcional: pular o interceptor por header
  // Use: headers: new HttpHeaders({ 'X-Skip-Auth-Redirect': 'true' })
  if (req.headers.get('X-Skip-Auth-Redirect') === 'true') {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const status = err.status;

        // Ajuste aqui conforme seu backend:
        // 401 = não autenticado
        // 403 = proibido (às vezes usado quando token expira)
        // 419 = CSRF/Session expired (comum em alguns backends)
        const shouldRedirect =
          status === 401 || status === 403 || status === 419;

        const currentUrl = router.url || '';
        console.log(`url: `, currentUrl);
        const alreadyOnAuth = isAuthRoute(currentUrl);

        if (shouldRedirect && !alreadyOnAuth) {
          // Opcional: guardar a rota para voltar depois do login
          router.navigate(['/sign-in'], {
            queryParams: { redirect: currentUrl },
          });
        }
      }

      return throwError(() => err);
    })
  );
};
