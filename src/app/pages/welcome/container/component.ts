import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-welcome',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  protected authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  protected isLoading = computed(
    () => this.authService.loading() || this.authService.redirectInProgress()
  );

  handleAuthAction(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/pets']);
    } else {
      this.authService.signInWithGoogle();
    }
  }
}
