import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { XNavbarComponent } from '../../../shared/navbar/container/component';
import { AuthService } from '../../../core/services/auth';
import { DataService } from '../../../core/services/data';
import { UploadService } from '../../../core/services/upload';
import type { XPet, PetColor, PetBreed } from '../../../core/models/pet';
import { PetBreedsService } from '../../../core/services/breed';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BreedSelectorComponent } from '../../breedSelector/container/component';
import { take } from 'rxjs';
import { UtilService } from '../../../core/services/util';

@Component({
  selector: 'x-register-pet',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    XNavbarComponent,
  ],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterPetComponent extends UtilService {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private uploadService = inject(UploadService);
  private petBreedsService = inject(PetBreedsService);
  private snackBar = inject(MatSnackBar);
  router = inject(Router);

  petForm: FormGroup;
  isLoading = signal(false);
  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);
  uploadProgress = signal(0);
  selectedColors = signal<string[]>([]);
  primaryColor = signal<string>('');
  private bottomSheet = inject(MatBottomSheet);
  private route = inject(ActivatedRoute);

  selectedBreedId = signal<string>('');

  selectedBreedInfo = computed(() => {
    const breedId = this.selectedBreedId();
    if (!breedId) return null;
    return this.petBreedsService.getBreedById(breedId);
  });

  availableBreeds = computed(() => {
    const selectedType = this.petForm?.get('xType')?.value;
    if (selectedType) {
      return this.petBreedsService.getBreedsByType(selectedType);
    }
    return [];
  });

  constructor() {
    super();

    this.petForm = this.fb.group({
      xName: ['', [Validators.required, Validators.minLength(2)]],
      xType: ['', Validators.required],
      xBreed: ['', Validators.required],
      xBirthDate: ['', Validators.required],
      xGender: ['', Validators.required],
      xDescription: ['', [Validators.required, Validators.minLength(10)]],
      xHasPedigree: [false],
      xFurType: ['', Validators.required],
      xIsDeceased: [false],
      xIsNeutered: [false],
    });

    this.petForm.get('xType')?.valueChanges.subscribe(() => {
      this.petForm.patchValue({ xBreed: '' });
    });

    effect(() => {
      const breedId = this.selectedBreedId();
      if (breedId && this.petForm.get('xBreed')?.value !== breedId) {
        this.petForm.patchValue({ xBreed: breedId }, { emitEvent: false });
      }
    });

    const petId = this.route.snapshot.params['petId'];
    if (petId) {
      this.loadPetData(petId);
    }
  }

  private async loadPetData(petId: string): Promise<void> {
    try {
      this.isLoading.set(true);

      const pet = await this.dataService.getPet(petId).pipe(take(1)).toPromise();

      if (!pet) {
        this.snackBar.open('No se encontró la mascota', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/pets']);
        return;
      }

      const user = this.authService.user();
      if (pet.xIdUser !== user?.uid) {
        this.snackBar.open('No tienes permisos para editar esta mascota', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/pets']);
        return;
      }

      this.selectedBreedId.set(pet.xBreed || '');

      const allColors = [pet.xColorPrimary, ...(pet.xColorSecondary || [])].filter(Boolean);
      this.selectedColors.set(allColors);
      this.primaryColor.set(pet.xColorPrimary || '');

      const birthDate = this.convertToDate(pet.xBirthDate);

      this.petForm.patchValue({
        xName: pet.xName || '',
        xType: pet.xType || '',
        xBreed: pet.xBreed || '',
        xBirthDate: birthDate,
        xGender: pet.xGender || '',
        xDescription: pet.xDescription || '',
        xHasPedigree: pet.xHasPedigree || false,
        xFurType: pet.xFurType || '',
        xIsDeceased: pet.xIsDeceased || false,
        xIsNeutered: pet.xIsNeutered || false,
      });

      if (pet.xImage && pet.xImage.length > 0) {
        this.previewUrls.set(pet.xImage);
        const simulatedFiles = pet.xImage.map(
          () => new File([''], 'existing.jpg', { type: 'image/jpeg' })
        );
        this.selectedFiles.set(simulatedFiles);
      }
    } catch (error) {
      this.snackBar.open('Error al cargar los datos', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/pets']);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectColor(color: PetColor): void {
    const currentColors = this.selectedColors();
    const colorIndex = currentColors.indexOf(color.id);

    if (colorIndex === -1) {
      if (currentColors.length < 3) {
        this.selectedColors.update((colors) => [...colors, color.id]);

        if (currentColors.length === 0) {
          this.primaryColor.set(color.id);
        }
      } else {
        this.snackBar.open('Máximo 3 colores permitidos', 'Cerrar', { duration: 2000 });
      }
    } else {
      this.selectedColors.update((colors) => colors.filter((c) => c !== color.id));
      if (this.primaryColor() === color.id) {
        this.primaryColor.set('');
      }
    }
  }

  setPrimaryColor(colorId: string): void {
    if (this.selectedColors().includes(colorId)) {
      this.primaryColor.set(colorId);
    }
  }

  isColorSelected(colorId: string): boolean {
    return this.selectedColors().includes(colorId);
  }

  isPrimaryColor(colorId: string): boolean {
    return this.primaryColor() === colorId;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const currentCount = this.previewUrls().length;
    const validation = this.validateFileSelection(files, currentCount, 5);

    if (validation.hasError && validation.errorMessage) {
      this.snackBar.open(validation.errorMessage, 'Cerrar', { duration: 5000 });
    }

    const validFiles = validation.validFiles;

    const isEditing = !!this.route.snapshot.params['petId'];

    if (isEditing) {
      const existingUrls = this.previewUrls().filter((url) => url.startsWith('http'));
      const currentFiles = this.selectedFiles().filter((f) => f.size > 0);

      this.selectedFiles.set([...currentFiles, ...validFiles]);

      this.generatePreviewsForEditing(validFiles, existingUrls);
    } else {
      const currentFiles = this.selectedFiles();
      this.selectedFiles.set([...currentFiles, ...validFiles]);

      const currentPreviews = this.previewUrls();
      this.generatePreviewsAppending(validFiles, currentPreviews);
    }

    input.value = '';
  }

  private async generatePreviewsAppending(
    newFiles: File[],
    currentPreviews: string[]
  ): Promise<void> {
    const updatedPreviews = await this.generateImagePreviews(newFiles, currentPreviews);
    this.previewUrls.set(updatedPreviews);
  }

  private async generatePreviewsForEditing(
    newFiles: File[],
    existingUrls: string[]
  ): Promise<void> {
    const updatedPreviews = await this.generateImagePreviewsForEditing(newFiles, existingUrls);
    this.previewUrls.set(updatedPreviews);
  }

  removeImage(index: number): void {
    const files = this.selectedFiles();
    const previews = this.previewUrls();
    const isEditing = !!this.route.snapshot.params['petId'];

    const result = this.removeImageFromArrays(index, files, previews, isEditing);

    this.selectedFiles.set(result.updatedFiles);
    this.previewUrls.set(result.updatedPreviews);
  }

  async onSubmit(): Promise<void> {
    if (this.petForm.invalid) {
      this.markFormGroupTouched(this.petForm);
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (!this.isValidColorSelection(this.selectedColors())) {
      this.snackBar.open('Debes seleccionar al menos un color predominante.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const user = this.authService.user();
    if (!user) {
      this.snackBar.open('Error: Usuario no autenticado.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const petId = this.route.snapshot.params['petId'] || this.dataService.generatePetId();
    const isEditing = !!this.route.snapshot.params['petId'];

    if (!isEditing && this.selectedFiles().length === 0) {
      this.snackBar.open('Debes subir al menos una foto de tu mascota.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isLoading.set(true);

    try {
      let imageUrls: string[] = [];

      if (isEditing) {
        imageUrls = this.previewUrls().filter((url) => url.startsWith('http'));

        const realNewFiles = this.selectedFiles().filter((f) => f.size > 0);

        if (realNewFiles.length > 0) {
          this.uploadProgress.set(25);

          const newImageUrls = await this.uploadService
            .uploadPetImages(realNewFiles, petId, user.uid)
            .toPromise();

          if (newImageUrls && newImageUrls.length > 0) {
            imageUrls = [...imageUrls, ...newImageUrls];
          }

          this.uploadProgress.set(50);
        } else {
          this.uploadProgress.set(50);
        }
      } else {
        this.uploadProgress.set(25);

        const uploadedUrls = await this.uploadService
          .uploadPetImages(this.selectedFiles(), petId, user.uid)
          .toPromise();

        if (uploadedUrls && uploadedUrls.length > 0) {
          imageUrls = uploadedUrls;
        }

        this.uploadProgress.set(50);
      }

      const formData = this.petForm.value;

      let birthDate: Date;

      if (formData.xBirthDate instanceof Date) {
        birthDate = formData.xBirthDate;
      } else {
        birthDate = this.convertToDate(formData.xBirthDate);
      }

      if (!this.isValidBirthDate(birthDate)) {
        throw new Error('La fecha de nacimiento no es válida');
      }
      const petData: Partial<XPet> = {
        xId: petId,
        xIdUser: user.uid,
        xName: formData.xName.trim(),
        xType: formData.xType,
        xBreed: formData.xBreed,
        xBirthDate: birthDate,
        xGender: formData.xGender,
        xColorPrimary: this.primaryColor(),
        xColorSecondary: this.selectedColors().filter((c) => c !== this.primaryColor()),
        xDescription: formData.xDescription.trim(),
        xImage: imageUrls,
        xCurrentStatus: isEditing
          ? formData.xIsDeceased
            ? 5
            : undefined
          : formData.xIsDeceased
          ? 5
          : 1,
        xHasPedigree: formData.xHasPedigree,
        xFurType: formData.xFurType,
        xIsDeceased: formData.xIsDeceased,
        xIsNeutered: formData.xIsNeutered,
        xUpdatedAt: new Date(),
      };

      if (!isEditing) {
        petData.xCreatedAt = new Date();
      }

      if (isEditing && !formData.xIsDeceased) {
        delete petData.xCurrentStatus;
      }

      this.uploadProgress.set(75);

      if (isEditing) {
        await this.dataService.updatePet(petId, petData);

        this.uploadProgress.set(100);

        this.snackBar.open(`¡${petData.xName} ha sido actualizado exitosamente!`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        setTimeout(() => {
          this.router.navigate(['/pets', petId]);
        }, 500);
      } else {
        await this.dataService.createPet(petData as XPet);

        this.uploadProgress.set(100);

        this.snackBar.open(`¡${petData.xName} ha sido registrado exitosamente!`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        setTimeout(() => {
          this.router.navigate(['/pets', petId]);
        }, 500);
      }
      setTimeout(() => {
        this.router.navigate(['/pets']);
      }, 500);
    } catch (error: any) {
      let errorMessage = 'Hubo un error al guardar la información de tu mascota.';

      if (error.message?.includes('fecha')) {
        errorMessage = 'La fecha de nacimiento no es válida.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'No tienes permisos para realizar esta acción.';
      } else if (error.message?.includes('storage')) {
        errorMessage = 'Error al subir las imágenes. Inténtalo de nuevo.';
      }

      this.snackBar.open(errorMessage + ' Inténtalo de nuevo.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading.set(false);
      this.uploadProgress.set(0);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.petForm.get(fieldName);
    return this.getFieldErrorMessage(fieldName, control);
  }

  selectPetType(value: number): void {
    this.petForm.patchValue({ xType: value });
  }

  selectGender(value: number): void {
    this.petForm.patchValue({ xGender: value });
  }

  getBreedInfo(breedId: string) {
    return this.petBreedsService.getBreedById(breedId);
  }

  openBreedSelector(): void {
    const petType = this.petForm.get('xType')?.value;

    if (!petType) {
      this.snackBar.open('Selecciona primero el tipo de mascota', 'Cerrar', { duration: 2000 });
      return;
    }

    const bottomSheetRef = this.bottomSheet.open(BreedSelectorComponent, {
      data: { petType },
      disableClose: false,
      hasBackdrop: true,
      height: '80%',
    });

    bottomSheetRef.afterDismissed().subscribe({
      next: (breed: PetBreed | undefined) => {
        if (breed) {
          this.selectedBreedId.set(breed.id);

          this.snackBar.open(`Raza seleccionada: ${breed.nameEs}`, 'Cerrar', {
            duration: 2000,
          });
        }
      },
    });
  }
}
