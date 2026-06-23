import { Routes } from '@angular/router';
import { SignInComponent } from './modules/auth/sign-in/sign-in.component';
import { SignUpComponent } from './modules/auth/sign-up/sign-up.component';
import { AccountRecoveryComponent } from './modules/auth/account-recovery/account-recovery.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './modules/auth/guard/auth.guard';
import { SignOutComponent } from './modules/auth/sign-out/sign-out.component';
import { OneTimeSignComponent } from './modules/auth/one-time-sign/one-time-sign.component';
import { loginGuard } from './modules/auth/guard/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  // {
  //   path: 'wait',
  //   component: WaitPageComponent,
  // },
  // {
  // {
  //   path: 'cc',
  //   loadChildren: () => import('./modules/courses/routes/courses.route'),
  // },
  // {
  //   path: 'one-time-login',
  //   component: OneTimeSignComponent,
  // },
  // {
  //   path: 'product-community',
  //   loadChildren: () =>
  //     import('./modules/product-comunity/routes/product-comunity.routes'),
  // },
  // {
  //   path: 'checkout',
  //   loadChildren: () => import('./modules/checkout/routes/checkout.routes'),
  // },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },
  {
    path: 'sign-out',
    component: SignOutComponent,
  },
  {
    path: 'account-recovery',
    component: AccountRecoveryComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // {
      //   path: 'dashboard',
      //   loadChildren: () =>
      //     import('./modules/dashboard/routes/dashboard.routes'),
      // },

      // Sales routes
      // {
      //   path: '',
      //   loadChildren: () => import('./modules/sales/routes/sales.routes'),
      // },
      // Finance routes
      // {
      //   path: 'finance',
      //   loadChildren: () => import('./modules/finance/routes/finance.routes'),
      // },

      // myaffiliates routes
      // {
      //   path: '',
      //   loadChildren: () =>
      //     import('./modules/myaffiliates/routes/myaffiliates.routes'),
      // },

      // marketplace routes
      // {
      //   path: '',
      //   loadChildren: () =>
      //     import('./modules/marketplace/routes/markeplace.routes'),
      // },

      // Profile
      {
        path: 'myprofile',
        loadChildren: () => import('./modules/profile/routes/profile.routes'),
      },

      // Users management routes
      {
        path: 'users-management',
        loadChildren: () =>
          import(
            './modules/admin/user-management/routes/user-management.routes'
          ),
      },

      // Products management routes
      {
        path: 'products-management',
        loadChildren: () =>
          import(
            './modules/admin/product-management/routes/product-management.routes'
          ),
      },

      // Sales management routes
      {
        path: 'sales-management',
        loadChildren: () =>
          import(
            './modules/admin/sales-management/routes/sales-management.routes'
          ),
      },

      // Sales 2 management routes
      {
        path: 'orders-management',
        loadChildren: () =>
          import(
            './modules/admin/orders-management/routes/orders-management.routes'
          ),
      },

      // {
      //   path: '',
      //   loadChildren: () => import('./modules/product/routes/product.routes'),
      // },

      // Finance management routes
      {
        path: 'finance-management',
        loadChildren: () =>
          import('./modules/admin/finance-management/routes/finance.routes'),
      },

      {
        path: 'dashboard-management',
        loadChildren: () =>
          import(
            './modules/admin/dashboard-management/routes/dashboard-management.routes'
          ),
      },

      // {
      //   path: 'my-purchases',
      //   loadChildren: () =>
      //     import('./modules/my-purchases/routes/my-purchases.routes'),
      // },

      // {
      //   path: 'apps',
      //   loadChildren: () => import('./modules/apps/routes/apps.routes'),
      // },

      // {
      //   path: 'member-area',
      //   loadChildren: () =>
      //     import('./modules/member-area/routes/member-area.routes'),
      // },
    ],
  },

  // {
  //   path: '**',
  //   redirectTo: 'sign-in',
  // },
];
