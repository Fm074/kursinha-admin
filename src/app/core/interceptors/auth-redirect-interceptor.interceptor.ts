import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];

function isAuthRoute(url: string): boolean {
  return AUTH_ROUTES.some((r) => url.startsWith(r));
}

export const authRedirectInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const clone = req.clone({ withCredentials: true });

  return next(clone).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const status = err.status;
        const shouldRedirect =
          status === 401 || status === 403 || status === 419;

        const currentUrl = router.url || '/';
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
