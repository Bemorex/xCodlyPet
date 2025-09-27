import {
  Component,
  signal,
  computed,
  inject,
  input,
  booleanAttribute,
  TemplateRef,
} from '@angular/core';
import { Location, NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PwaService } from '../../../core/services/pwa';

interface NavItem {
  icon: string;
  label: string;
  dividerAfter?: boolean;
  router: string;
}

@Component({
  selector: 'x-navbar',
  imports: [RouterLinkActive, RouterLink, NgTemplateOutlet],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
})
export class XNavbarComponent {
  protected authService = inject(AuthService);
  protected readonly user = this.authService.user;
  private readonly location = inject(Location);
  private pwaService = inject(PwaService);

  public isUpdateAvailable = computed(() => !!this.pwaService.updateReady());

  public canBeInstalled = computed(() => !!this.pwaService.installPrompt());

  public showPwaBanner = computed(() => this.isUpdateAvailable() || this.canBeInstalled());

  logo = signal('brand/logo-letter.svg');
  title = signal('XPet');

  xTitle = input.required<string>();
  xDescription = input<string>('');
  xSmall = input<boolean, unknown>(true, { transform: booleanAttribute });
  xActions = input<TemplateRef<any> | null>(null);

  menuItems = signal<NavItem[]>([
    { icon: 'pets', label: 'Mascotas', router: '/pets' },
    { icon: 'report', label: 'Perfil', router: '/profile' },
  ]);

  primaryItems = computed(() => this.menuItems().slice(0, 4));

  setActive(label: string) {
    this.menuItems.update((items) =>
      items.map((item) => ({ ...item, active: item.label === label }))
    );
  }

  goBack(): void {
    this.location.back();
  }

  public handlePwaAction(): void {
    if (this.isUpdateAvailable()) {
      this.pwaService.activateUpdate();
    } else {
      this.pwaService.promptToInstall();
    }
  }
}
