import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, filter, take, switchMap } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loading$ = toObservable(authService.loading);
  const isAuthenticated$ = toObservable(authService.isAuthenticated);

  return loading$.pipe(
    filter((loading) => !loading),
    take(1),
    switchMap(() => isAuthenticated$),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      router.navigate(['/welcome']);
      return false;
    })
  );
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const loading$ = toObservable(authService.loading);
  const isAuthenticated$ = toObservable(authService.isAuthenticated);

  return loading$.pipe(
    filter((loading) => !loading),
    take(1),
    switchMap(() => isAuthenticated$),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        router.navigate(['/pets']);
        return false;
      }
      return true;
    })
  );
};
