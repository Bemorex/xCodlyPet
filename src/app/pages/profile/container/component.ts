import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { XNavbarComponent } from '../../../shared/navbar/container/component';
import { take } from 'rxjs';
import { XUser } from '../../../core/models/user';
import { AuthService } from '../../../core/services/auth';
import { DataService } from '../../../core/services/data';
import { UtilService } from '../../../core/services/util';

@Component({
  selector: 'x-profile',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    XNavbarComponent,
  ],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileComponent extends UtilService implements OnInit {
  private fb = inject(FormBuilder);
  protected authService = inject(AuthService);
  private dataService = inject(DataService);
  private snackBar = inject(MatSnackBar);

  profileForm: FormGroup;
  isReadOnly = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);

  constructor() {
    super();
    this.profileForm = this.fb.group({
      xName: ['', [Validators.required, Validators.minLength(2)]],
      xEmail: ['', [Validators.required, Validators.email]],
      xPhone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
      xDirection: [''],
      xStatus: [{ value: 1, disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    const profile = this.authService.userProfile();
    if (profile) {
      this.loadProfileData(profile);
    }
  }

  loadProfileData(profile: XUser): void {
    this.profileForm.patchValue({
      xName: profile.xName || profile.xDisplayName || '',
      xEmail: profile.xEmail || '',
      xPhone: profile.xPhone || '',
      xDirection: profile.xDirection || '',
      xStatus: profile.xStatus || 1,
    });

    this.isReadOnly.set(profile.xStatus === 3);

    if (this.isReadOnly()) {
      this.profileForm.disable();
    }

    this.isLoading.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || this.isSaving() || this.isReadOnly()) {
      this.markFormGroupTouched(this.profileForm);
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isSaving.set(true);
    const uid = this.authService.user()?.uid;

    if (!uid) {
      this.snackBar.open('Error: Usuario no autenticado.', 'Cerrar', {
        duration: 3000,
      });
      this.isSaving.set(false);
      return;
    }

    try {
      const formData = this.profileForm.getRawValue();

      const updateData: Partial<XUser> = {
        xName: formData.xName,
        xEmail: formData.xEmail,
        xPhone: formData.xPhone,
        xDirection: formData.xDirection,
      };

      await this.dataService.updateUserProfile(uid, updateData);

      const updatedProfile = await this.dataService.getUserProfile(uid).pipe(take(1)).toPromise();

      (this.authService as any)._userProfile.set(updatedProfile);

      this.snackBar.open('Perfil actualizado exitosamente.', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    } catch (error) {
      this.snackBar.open('Hubo un error al guardar tu perfil. Inténtalo de nuevo.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    return this.getFieldErrorMessage(fieldName, control);
  }
}
