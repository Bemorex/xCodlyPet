import { ApplicationRef, inject, Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { filter, first } from 'rxjs/operators';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private appRef = inject(ApplicationRef);
  private updates = inject(SwUpdate);

  private installPromptSignal = signal<BeforeInstallPromptEvent | null>(null);
  public readonly installPrompt = this.installPromptSignal.asReadonly();
  private updateReadySignal = signal<VersionReadyEvent | null>(null);
  public readonly updateReady = this.updateReadySignal.asReadonly();

  constructor() {
    if (typeof window === 'undefined' || !this.updates.isEnabled) {
      return;
    }

    this.listenForInstallPrompt();
    this.handleUpdates();
    this.handleUnrecoverableState();
  }

  private listenForInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      const typedEvent = event as BeforeInstallPromptEvent;
      typedEvent.preventDefault();
      this.installPromptSignal.set(typedEvent);
    });
  }

  private handleUpdates(): void {
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(() => this.updates.checkForUpdate());

    this.updates.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe((evt) => {
        this.updateReadySignal.set(evt);
      });
  }

  public async promptToInstall(): Promise<void> {
    const promptEvent = this.installPromptSignal();
    if (!promptEvent) {
      return;
    }
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    this.installPromptSignal.set(null);
  }

  public activateUpdate(): void {
    this.updates.activateUpdate().then(() => document.location.reload());
  }

  private handleUnrecoverableState(): void {
    this.updates.unrecoverable.subscribe((event) => {
      alert(
        'Ha ocurrido un error que no podemos recuperar.\n' +
          'Por favor, recarga la página para continuar.'
      );
    });
  }
}
