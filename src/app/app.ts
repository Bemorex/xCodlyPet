import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';

declare const ui: (selector?: string | Element, options?: any) => any;

type ThemeMode = 'light' | 'dark' | 'auto';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected authService = inject(AuthService);

  currentMode = signal<ThemeMode>('light');
  currentColor = signal<string>('#f38c06');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    try {
      if (typeof ui === 'function') {
        ui('mode', this.currentMode());
        ui('theme', this.currentColor());
      } else {
        setTimeout(() => this.initTheme(), 100);
      }
    } catch (error) {}
  }
}
