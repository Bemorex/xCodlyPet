import { Injectable, inject, signal, computed, DestroyRef, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import {
  Auth,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut,
  User,
  AuthError,
} from '@angular/fire/auth';
import { user } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, tap, take } from 'rxjs';
import { DataService } from './data';
import { XUser } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private dataService = inject(DataService);

  private _user = signal<User | null>(null);
  private _userProfile = signal<XUser | null>(null);
  private _loading = signal<boolean>(true);
  private _redirectInProgress = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly userProfile = this._userProfile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly redirectInProgress = this._redirectInProgress.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => !!this.user());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAppState();
    } else {
      this._loading.set(false);
    }
  }

  private async initializeAppState(): Promise<void> {
    if (sessionStorage.getItem('firebase_redirect_in_progress') === 'true') {
      this._redirectInProgress.set(true);
    }

    try {
      const credential = await getRedirectResult(this.auth);
      if (credential) {
        await this.checkAndCreateProfile(credential.user);
      }
    } catch (error) {
      this.handleAuthError(error as AuthError);
    } finally {
      this._redirectInProgress.set(false);
      sessionStorage.removeItem('firebase_redirect_in_progress');
    }

    user(this.auth)
      .pipe(
        tap((u) => this._user.set(u)),
        switchMap((u) => (u ? this.dataService.getUserProfile(u.uid) : of(null))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((profile) => {
        this._userProfile.set(profile as XUser | null);
        if (this.loading()) {
          this._loading.set(false);
        }
      });
  }

  private async checkAndCreateProfile(user: User): Promise<void> {
    const profile$ = this.dataService.getUserProfile(user.uid).pipe(take(1));
    const profile = await profile$.toPromise();
    if (!profile) {
      await this.dataService.createUserProfile(user);
    }
  }

  async signInWithGoogle(): Promise<void> {
    const isDevelopment =
      isPlatformBrowser(this.platformId) && window.location.hostname === 'localhost';
    await (isDevelopment ? this.signInWithGooglePopup() : this.signInWithGoogleRedirect());
  }

  private async signInWithGooglePopup(): Promise<void> {
    try {
      this.clearError();
      const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
      if (credential.user) {
        await this.checkAndCreateProfile(credential.user);
        this.router.navigate(['/pets']);
      }
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }
  private async signInWithGoogleRedirect(): Promise<void> {
    try {
      this.clearError();
      sessionStorage.setItem('firebase_redirect_in_progress', 'true');
      this._redirectInProgress.set(true);
      await signInWithRedirect(this.auth, new GoogleAuthProvider());
    } catch (error: any) {
      this.clearRedirectState();
      this.handleAuthError(error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigate(['/welcome']);
    this._userProfile.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  private clearRedirectState(): void {
    sessionStorage.removeItem('firebase_redirect_in_progress');
    this._redirectInProgress.set(false);
  }

  private handleAuthError(error: AuthError): void {
    let errorMessage = 'Ocurrió un error de autenticación.';
    this._error.set(errorMessage);
  }
}
