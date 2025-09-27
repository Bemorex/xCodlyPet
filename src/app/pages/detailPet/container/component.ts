import {
  Component,
  inject,
  signal,
  computed,
  Input,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { XNavbarComponent } from '../../../shared/navbar/container/component';
import { AuthService } from '../../../core/services/auth';
import { DataService } from '../../../core/services/data';
import { PetBreedsService } from '../../../core/services/breed';
import { XPet, PetStatusOption } from '../../../core/models/pet';
import { UtilService } from '../../../core/services/util';
import ReportDetailBottomSheetComponent from '../../detailReport/container/component';

@Component({
  selector: 'x-pet-detail',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    XNavbarComponent,
    RouterLink,
  ],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PetDetailComponent extends UtilService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private petBreedsService = inject(PetBreedsService);
  private snackBar = inject(MatSnackBar);
  private bottomSheet = inject(MatBottomSheet);

  private petIdFromRoute = signal<string | null>(null);

  @Input()
  set petId(petId: string) {
    this.petIdFromRoute.set(petId);
    this.loadPet(petId);
    const currentPet = this.pet();
    if (currentPet && currentPet.xCurrentStatus === 2) {
      this.loadActiveReport(currentPet.xId);
    }
  }

  pet = signal<XPet | null>(null);
  activeReport = signal<any>(null);
  ownerProfile = signal<any>(null);
  isLoading = signal(false);
  selectedImageIndex = signal(0);
  showImageGallery = signal(false);
  user = this.authService.user;

  isOwner = computed(() => {
    const currentPet = this.pet();
    const currentUser = this.user();
    return currentPet && currentUser && currentPet.xIdUser === currentUser.uid;
  });

  constructor() {
    super();

    effect(() => {
      const currentPet = this.pet();
      if (currentPet && currentPet.xIdUser) {
        this.loadOwnerProfile(currentPet.xIdUser);
      }
    });
  }

  private loadPet(petId: string): void {
    this.dataService.getPet(petId).subscribe({
      next: (pet) => {
        this.pet.set(pet);

        if (pet && (pet.xCurrentStatus === 2 || pet.xCurrentStatus === 3)) {
          this.loadActiveReport(pet.xId);
        }
      },
      error: (error) => {
        this.snackBar.open('No se pudo cargar la mascota', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private loadOwnerProfile(userId: string): void {
    this.dataService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.ownerProfile.set(profile);
      },
      error: (error) => {},
    });
  }

  private loadActiveReport(petId: string): void {
    this.dataService.getAllReports().subscribe({
      next: (reports) => {
        const activeReport = reports.find((r) => r.xIdPet === petId && r.xStatus === 1);
        this.activeReport.set(activeReport || null);
      },
      error: (error) => {},
    });
  }

  getStatusInfo(status: number | undefined): PetStatusOption {
    return this.getPetStatusInfo(status);
  }

  getBreedLabel(breedId: string): string {
    if (!breedId) return 'Raza no especificada';
    const breed = this.petBreedsService.getBreedById(breedId);
    return breed ? breed.nameEs : 'Raza desconocida';
  }

  getBreedInfo(breedId: string) {
    return this.petBreedsService.getBreedById(breedId);
  }

  openImageGallery(index: number = 0): void {
    this.selectedImageIndex.set(index);
    this.showImageGallery.set(true);
  }

  closeImageGallery(): void {
    this.showImageGallery.set(false);
  }

  nextImage(): void {
    const currentPet = this.pet();
    if (currentPet && currentPet.xImage) {
      const currentIndex = this.selectedImageIndex();
      const nextIndex = (currentIndex + 1) % currentPet.xImage.length;
      this.selectedImageIndex.set(nextIndex);
    }
  }

  previousImage(): void {
    const currentPet = this.pet();
    if (currentPet && currentPet.xImage) {
      const currentIndex = this.selectedImageIndex();
      const prevIndex = currentIndex === 0 ? currentPet.xImage.length - 1 : currentIndex - 1;
      this.selectedImageIndex.set(prevIndex);
    }
  }

  async reportAsLost(): Promise<void> {
    const currentPet = this.pet();
    if (!currentPet || !this.isOwner()) return;

    this.router.navigate(['/reports/create', currentPet.xId]);
  }

  async markAsSafe(): Promise<void> {
    const currentPet = this.pet();
    if (!currentPet || !this.isOwner()) return;

    try {
      this.isLoading.set(true);

      await this.dataService.updatePet(currentPet.xId, {
        xCurrentStatus: 1,
        xUpdatedAt: new Date(),
      });

      const report = this.activeReport();
      if (report) {
        await this.dataService.updateReport(report.xId, {
          xStatus: 2,
          xResolvedAt: new Date(),
        });
      }

      this.snackBar.open(`¡Qué bueno! ${currentPet.xName} está en casa.`, 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Error al actualizar el estado. Inténtalo de nuevo.', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  async markForAdoption(): Promise<void> {
    const currentPet = this.pet();
    if (!currentPet || !this.isOwner()) return;

    try {
      this.isLoading.set(true);
      await this.dataService.updatePet(currentPet.xId, {
        xCurrentStatus: 4,
        xUpdatedAt: new Date(),
      });

      this.snackBar.open(`${currentPet.xName} está ahora disponible para adopción.`, 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Error al actualizar el estado. Inténtalo de nuevo.', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  editPet(): void {
    const currentPet = this.pet();
    if (currentPet) {
      this.router.navigate(['/pets', currentPet.xId, 'edit']);
    }
  }

  viewActiveReport(): void {
    const report = this.activeReport();
    const currentPet = this.pet();

    if (report && currentPet) {
      this.bottomSheet.open(ReportDetailBottomSheetComponent, {
        data: {
          report,
          pet: currentPet,
          isOwner: this.isOwner(),
        },
        hasBackdrop: true,
        disableClose: false,
      });
    } else {
      this.snackBar.open('No hay un reporte activo para esta mascota.', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  async revertFromAdoption(): Promise<void> {
    const currentPet = this.pet();
    if (!currentPet || !this.isOwner()) return;

    try {
      this.isLoading.set(true);

      await this.dataService.updatePet(currentPet.xId, {
        xCurrentStatus: 1,
        xUpdatedAt: new Date(),
      });

      this.snackBar.open(`${currentPet.xName} ya no está disponible para adopción.`, 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Error al actualizar el estado. Inténtalo de nuevo.', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  contactViaWhatsApp(): void {
    const owner = this.ownerProfile();
    const pet = this.pet();

    if (!owner?.xPhone) {
      this.snackBar.open('No hay número de teléfono disponible', 'Cerrar', { duration: 2000 });
      return;
    }

    let message = '';

    if (pet?.xCurrentStatus === 4) {
      message = `Hola! Me interesa adoptar a ${pet?.xName}. ¿Podemos conversar sobre los detalles?`;
    } else {
      message = `Hola! He visto información sobre ${pet?.xName}. Quisiera obtener más información.`;
    }

    const whatsappUrl = this.getWhatsAppLink(owner.xPhone, message);
    window.open(whatsappUrl, '_blank');
  }

  contactViaEmail(): void {
    const owner = this.ownerProfile();
    const pet = this.pet();

    if (!owner?.xEmail) {
      this.snackBar.open('No hay email disponible', 'Cerrar', { duration: 2000 });
      return;
    }

    let subject = '';
    let body = '';

    if (pet?.xCurrentStatus === 4) {
      subject = `Interés en adoptar a ${pet?.xName}`;
      body = `Hola ${owner.xName},\n\nMe interesa adoptar a ${pet?.xName}. Me gustaría coordinar una visita y conocer más detalles sobre el proceso de adopción.\n\nGracias por tu tiempo.`;
    } else {
      subject = `Consulta sobre ${pet?.xName}`;
      body = `Hola ${owner.xName},\n\nHe visto la información sobre ${pet?.xName} y me gustaría obtener más detalles.\n\nSaludos.`;
    }

    const emailUrl = this.getEmailLink(owner.xEmail, subject, body);
    window.open(emailUrl, '_blank');
  }

  callDirectly(): void {
    const owner = this.ownerProfile();

    if (!owner?.xPhone) {
      this.snackBar.open('No hay número de teléfono disponible', 'Cerrar', { duration: 2000 });
      return;
    }

    const phoneUrl = this.getPhoneLink(owner.xPhone);
    window.open(phoneUrl, '_self');
  }

  showAdoptionInterest(): void {
    const currentPet = this.pet();
    if (!currentPet) return;

    this.bottomSheet.open(ReportDetailBottomSheetComponent, {
      data: {
        pet: currentPet,
        isAdoptionInquiry: true,
        isOwner: false,
      },
      hasBackdrop: true,
      disableClose: false,
    });
  }

  goBack(): void {
    this.router.navigate(['/pets']);
  }
}
