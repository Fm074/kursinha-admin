import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];
 const PUBLIC_ENDPOINTS = ['/api/clients/login', '/api/clients/me'];

function isAuthRoute(url: string): boolean {
  return AUTH_ROUTES.some((r) => url.startsWith(r));
}

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some((p) => url.includes(p));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Endpoints públicos não precisam de redirect
  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  const clone = req.clone({ withCredentials: true });

  return next(clone).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const status = err.status;
        const shouldRedirect =
          status === 401 || status === 403 || status === 419;

        const currentUrl = router.url || '';
        if (shouldRedirect && !isAuthRoute(currentUrl)) {
          router.navigate(['/sign-in'], {
            queryParams: { redirect: currentUrl },
          });
        }
      }

      return throwError(() => err);
    })
  );
};
