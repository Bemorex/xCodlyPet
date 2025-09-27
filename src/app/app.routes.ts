import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth';

export const routes: Routes = [
  {
    path: 'welcome',
    loadComponent: () =>
      import('./pages/welcome/container/component').then((m) => m.WelcomeComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/container/component').then((m) => m.default),
    canActivate: [authGuard],
  },

  {
    path: 'pets',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/listPet/container/component').then((m) => m.default),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/registerPet/container/component').then((m) => m.default),
      },

      {
        path: ':petId',
        loadComponent: () => import('./pages/detailPet/container/component').then((m) => m.default),
      },
      {
        path: ':petId/edit',
        loadComponent: () =>
          import('./pages/registerPet/container/component').then((m) => m.default),
      },
    ],
  },

  {
    path: 'reports',
    canActivate: [authGuard],
    children: [
      {
        path: 'create/:petId',
        loadComponent: () => import('./pages/reportPet/container/component').then((m) => m.default),
      },
    ],
  },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: '/welcome' },
];
