import {
  Component,
  inject,
  signal,
  computed,
  effect,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { XNavbarComponent } from '../../../shared/navbar/container/component';
import { AuthService } from '../../../core/services/auth';
import { DataService } from '../../../core/services/data';
import { UploadService } from '../../../core/services/upload';
import { LocationService } from '../../../core/services/location';
import { XPetReport } from '../../../core/models/pet';
import { UtilService } from '../../../core/services/util';

@Component({
  selector: 'x-create-report',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    GoogleMapsModule,
    XNavbarComponent,
    MatTimepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CreateReportComponent extends UtilService {
  private fb = inject(FormBuilder);
  router = inject(Router);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private uploadService = inject(UploadService);
  private snackBar = inject(MatSnackBar);
  public locationService = inject(LocationService);

  private petIdFromRoute = signal<string | null>(null);

  @Input()
  set petId(value: string) {
    if (value) {
      this.petIdFromRoute.set(value);
    }
  }

  reportForm: FormGroup;
  isLoading = signal(false);
  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);
  uploadProgress = signal(0);
  selectedLocation = signal<{ latitude: number; longitude: number; address: string } | null>(null);
  maxDate = new Date();

  private mapInstance: google.maps.Map | null = null;
  private currentAdvancedMarker: google.maps.marker.AdvancedMarkerElement | null = null;
  private isMapReady = signal(false);

  mapOptions: google.maps.MapOptions = {
    mapId: 'b5ebb46a2e2ab62e72818485',
    zoomControl: true,
    streetViewControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 8,
    clickableIcons: false,
    gestureHandling: 'cooperative',
    backgroundColor: '#f5f5f5',
  };

  user = this.authService.user;
  private userPets$ = this.dataService
    .getAllPets()
    .pipe(
      map((pets) =>
        pets.filter((pet) => pet.xIdUser === this.user()?.uid && pet.xCurrentStatus === 1)
      )
    );
  userPets = toSignal(this.userPets$, { initialValue: [] });

  preSelectedPet = computed(() => {
    let petId = this.petIdFromRoute();

    if (petId) {
      return this.userPets().find((pet) => pet.xId === petId);
    }
    return null;
  });

  isFormValid = computed(() => {
    return this.reportForm?.valid && this.selectedLocation() !== null && !this.isLoading();
  });

  constructor() {
    super();

    this.reportForm = this.fb.group({
      xIdPet: ['', Validators.required],
      xIncidentDate: [new Date(), Validators.required],
      xIncidentTime: [this.getDefaultTime(), Validators.required],
      xLastSeenLocation: ['', [Validators.required, Validators.minLength(10)]],
      xCircumstances: [''],
      xRewardAmount: [0, [Validators.min(0)]],
    });

    effect(() => {
      const preSelected = this.preSelectedPet();
      if (preSelected && !this.reportForm.get('xIdPet')?.value) {
        this.reportForm.patchValue({ xIdPet: preSelected.xId });
      }
    });

    effect(() => {
      const location = this.selectedLocation();
      if (location && location.address && this.mapInstance) {
        const currentValue = this.reportForm.get('xLastSeenLocation')?.value;
        if (currentValue !== location.address) {
          this.reportForm.patchValue(
            {
              xLastSeenLocation: location.address,
            },
            { emitEvent: false }
          );
        }

        this.updateAdvancedMarker({
          lat: location.latitude,
          lng: location.longitude,
        });
      }
    });
  }

  async getCurrentLocation(): Promise<void> {
    try {
      this.locationService.isLoading.set(true);

      if (!navigator.geolocation) {
        throw new Error('La geolocalización no está disponible en este dispositivo');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      if (this.mapInstance) {
        this.mapInstance.setCenter({ lat, lng });
        this.mapInstance.setZoom(16);
      }

      this.locationService.setLocation(lat, lng, 16);

      let address = 'Ubicación actual';
      try {
        address = await this.reverseGeocode(lat, lng);
      } catch (geoError) {
        address = this.formatCoordinatesAsAddress(lat, lng);
      }

      const locationData = {
        latitude: lat,
        longitude: lng,
        address: address,
      };

      this.selectedLocation.set(locationData);

      this.updateAdvancedMarker({ lat, lng });

      this.snackBar.open(
        `Ubicación obtenida${accuracy ? ` (precisión: ${Math.round(accuracy)}m)` : ''}`,
        'Cerrar',
        { duration: 3000, panelClass: ['success-snackbar'] }
      );
    } catch (error: any) {
      let errorMessage = 'No se pudo obtener la ubicación actual.';

      if (error.code === 1) {
        errorMessage = 'Permiso de ubicación denegado. Permite el acceso en la configuración.';
      } else if (error.code === 2) {
        errorMessage = 'No se pudo determinar la ubicación. Verifica tu conexión.';
      } else if (error.code === 3) {
        errorMessage = 'Tiempo de espera agotado. Inténtalo de nuevo.';
      }

      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.locationService.isLoading.set(false);
    }
  }

  onMapReady(map: google.maps.Map): void {
    this.mapInstance = map;
    this.isMapReady.set(true);

    const location = this.selectedLocation();
    if (location) {
      this.updateAdvancedMarker({
        lat: location.latitude,
        lng: location.longitude,
      });
    }

    if (!location) {
      map.setCenter({ lat: -17.9647, lng: -67.1073 }); // Oruro
      map.setZoom(13);
    }
  }

  private updateAdvancedMarker(position: google.maps.LatLngLiteral): void {
    if (!this.mapInstance) {
      return;
    }

    try {
      if (this.currentAdvancedMarker) {
        this.currentAdvancedMarker.map = null;
      }

      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-incident-marker';
        markerElement.innerHTML = `
          <div style="
            background: #dc2626;
            border: 3px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            color: white;
            font-weight: bold;
            font-size: 16px;
          ">
            📍
          </div>
        `;

        this.currentAdvancedMarker = new google.maps.marker.AdvancedMarkerElement({
          map: this.mapInstance,
          position: position,
          content: markerElement,
          title: 'Ubicación del incidente',
          gmpDraggable: false,
        });
      } else {
        this.createClassicMarkerFallback(position);
      }
    } catch (error) {
      this.createClassicMarkerFallback(position);
    }
  }

  private createClassicMarkerFallback(position: google.maps.LatLngLiteral): void {
    if (!this.mapInstance) return;

    if (this.currentAdvancedMarker) {
      this.currentAdvancedMarker.map = null;
    }

    const classicMarker = new google.maps.Marker({
      map: this.mapInstance,
      position: position,
      title: 'Ubicación del incidente',
      icon: {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#dc2626" stroke="white" stroke-width="3"/>
            <text x="15" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">📍</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 15),
      },
    });

    this.currentAdvancedMarker = classicMarker as any;
  }

  async onMapClick(event: google.maps.MapMouseEvent): Promise<void> {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    try {
      this.updateAdvancedMarker({ lat, lng });

      const address = await this.reverseGeocode(lat, lng);

      const locationData = {
        latitude: lat,
        longitude: lng,
        address: address,
      };

      this.selectedLocation.set(locationData);
    } catch (error) {
      const locationData = {
        latitude: lat,
        longitude: lng,
        address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
      };

      this.selectedLocation.set(locationData);
    }
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const currentCount = this.previewUrls().length;
    const validation = this.validateFileSelection(files, currentCount, 3);

    if (validation.hasError && validation.errorMessage) {
      this.snackBar.open(validation.errorMessage, 'Cerrar', { duration: 5000 });
    }

    const validFiles = validation.validFiles;

    const currentFiles = this.selectedFiles();
    this.selectedFiles.set([...currentFiles, ...validFiles]);

    const currentPreviews = this.previewUrls();
    await this.generatePreviewsAppending(validFiles, currentPreviews);

    input.value = '';
  }

  private async generatePreviewsAppending(
    newFiles: File[],
    currentPreviews: string[]
  ): Promise<void> {
    const updatedPreviews = await this.generateImagePreviews(newFiles, currentPreviews);
    this.previewUrls.set(updatedPreviews);
  }

  removeImage(index: number): void {
    const files = this.selectedFiles();
    const previews = this.previewUrls();

    files.splice(index, 1);
    previews.splice(index, 1);

    this.selectedFiles.set([...files]);
    this.previewUrls.set([...previews]);
  }

  async onSubmit(): Promise<void> {
    if (this.reportForm.invalid) {
      this.markFormGroupTouched(this.reportForm);

      const errors = this.getInvalidFields(this.reportForm);

      this.snackBar.open(`Campos incompletos: ${errors.join(', ')}`, 'Cerrar', { duration: 4000 });
      return;
    }

    if (!this.selectedLocation()) {
      this.snackBar.open('Debes seleccionar una ubicación en el mapa.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const user = this.user();
    if (!user) {
      this.snackBar.open('Error: Usuario no autenticado.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isLoading.set(true);

    try {
      const reportId = this.dataService.generateReportId();
      let imageUrls: string[] = [];

      if (this.selectedFiles().length > 0) {
        this.uploadProgress.set(25);

        imageUrls =
          (await this.uploadService
            .uploadPetImages(this.selectedFiles(), reportId, user.uid)
            .toPromise()) || [];

        this.uploadProgress.set(50);
      }

      const formData = this.reportForm.value;
      const location = this.selectedLocation()!;

      const reportData: XPetReport = {
        xId: reportId,
        xIdPet: formData.xIdPet,
        xIdUser: user.uid,
        xReportType: 1,
        xIncidentDate: formData.xIncidentDate,
        xIncidentTime: this.formatTime(formData.xIncidentTime),
        xLastSeenLocation: location.address,
        xLatitude: location.latitude,
        xLongitude: location.longitude,
        xCircumstances: formData.xCircumstances || '',
        xRewardAmount: formData.xRewardAmount || 0,
        xImages: imageUrls,
        xStatus: 1,
        xCreatedAt: new Date(),
      };

      this.uploadProgress.set(75);

      await this.dataService.createReport(reportData);

      await this.dataService.updatePet(formData.xIdPet, {
        xCurrentStatus: 2,
        xUpdatedAt: new Date(),
      });
      this.uploadProgress.set(100);

      this.snackBar.open('Reporte creado exitosamente.', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });

      setTimeout(() => {
        this.router.navigate(['/pets', formData.xIdPet]);
      }, 500);
    } catch (error) {
      this.snackBar.open('Hubo un error al crear el reporte. Inténtalo de nuevo.', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.isLoading.set(false);
      this.uploadProgress.set(0);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.reportForm.get(fieldName);
    return this.getFieldErrorMessage(fieldName, control);
  }

  goBack(): void {
    this.router.navigate(['/pets']);
  }
}
