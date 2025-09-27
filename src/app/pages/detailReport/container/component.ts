import {
  Component,
  inject,
  signal,
  computed,
  effect,
  Inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GoogleMapsModule } from '@angular/google-maps';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { AuthService } from '../../../core/services/auth';
import { DataService } from '../../../core/services/data';
import { UtilService } from '../../../core/services/util';

interface ReportDetailData {
  report?: any;
  pet?: any;
  isOwner: boolean;
  isAdoptionInquiry?: boolean;
}

@Component({
  selector: 'x-report-detail-bottom-sheet',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    GoogleMapsModule,
  ],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportDetailBottomSheetComponent extends UtilService {
  private bottomSheetRef = inject(MatBottomSheetRef<ReportDetailBottomSheetComponent>);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private snackBar = inject(MatSnackBar);

  report = signal<any>(null);
  isLoading = signal(false);
  ownerProfile = signal<any>(null);
  user = this.authService.user;

  isOwner = computed(() => {
    return this.data.isOwner;
  });

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    mapTypeControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: false,
  };

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: ReportDetailData
  ) {
    super();

    if (this.data.report) {
      this.report.set(this.data.report);
    }

    effect(() => {
      const currentReport = this.report();
      if (currentReport && currentReport.xIdUser) {
        this.loadOwnerProfile(currentReport.xIdUser);
      }
    });

    if (this.data.pet && this.data.pet.xIdUser && !this.data.report) {
      this.loadOwnerProfile(this.data.pet.xIdUser);
    }
  }

  private loadOwnerProfile(userId: string): void {
    this.dataService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.ownerProfile.set(profile);
      },
      error: (error) => {},
    });
  }

  async markAsResolved(): Promise<void> {
    const currentReport = this.report();
    if (!currentReport || !this.data.isOwner) return;

    try {
      this.isLoading.set(true);

      await this.dataService.updateReport(currentReport.xId, {
        xStatus: 2,
        xResolvedAt: new Date(),
      });

      await this.dataService.updatePet(currentReport.xIdPet, {
        xCurrentStatus: 1,
        xUpdatedAt: new Date(),
      });

      this.snackBar.open('Reporte marcado como resuelto. ¡Tu mascota está en casa!', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });

      this.close();
    } catch (error) {
      this.snackBar.open('Error al actualizar el reporte. Inténtalo de nuevo.', 'Cerrar', {
        duration: 3000,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  contactViaWhatsApp(): void {
    const owner = this.ownerProfile();
    const pet = this.data.pet;

    if (!owner?.xPhone) {
      this.snackBar.open('No hay número de teléfono disponible', 'Cerrar', { duration: 2000 });
      return;
    }

    let message = '';

    if (this.data.isAdoptionInquiry) {
      message = `Hola! Me interesa adoptar a ${pet?.xName}. ¿Podemos conversar?`;
    } else {
      message = `Hola! He visto información sobre ${pet?.xName}. Quisiera ayudar.`;
    }

    const whatsappUrl = this.getWhatsAppLink(owner.xPhone, message);
    window.open(whatsappUrl, '_blank');
  }

  contactViaEmail(): void {
    const owner = this.ownerProfile();
    const pet = this.data.pet;

    if (!owner?.xEmail) {
      this.snackBar.open('No hay email disponible', 'Cerrar', { duration: 2000 });
      return;
    }

    let subject = '';
    let body = '';

    if (this.data.isAdoptionInquiry) {
      subject = `Interés en adoptar a ${pet?.xName}`;
      body = `Hola ${owner.xName},\n\nMe interesa adoptar a ${pet?.xName}. Me gustaría conocer más detalles.\n\nGracias.`;
    } else {
      subject = `Información sobre ${pet?.xName}`;
      body = `Hola ${owner.xName},\n\nHe visto la información sobre ${pet?.xName} y quisiera ayudar.\n\nSaludos.`;
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

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  getViewType(): 'report' | 'adoption' | 'contact' {
    if (this.data.report) return 'report';
    if (this.data.isAdoptionInquiry) return 'adoption';
    return 'contact';
  }

  getSheetTitle(): string {
    const viewType = this.getViewType();

    switch (viewType) {
      case 'report':
        return 'Detalle del Reporte';
      case 'adoption':
        return 'Información de Adopción';
      default:
        return 'Información de Contacto';
    }
  }

  shareReportViaWhatsApp(): void {
    const currentReport = this.report();
    const pet = this.data.pet;

    if (!currentReport || !pet) {
      this.snackBar.open('No se puede compartir el reporte en este momento', 'Cerrar', {
        duration: 2000,
      });
      return;
    }

    let message = '';
    const petDetailUrl = `https://codly.pet/pets/${pet.xId}`;

    if (currentReport.xReportType === 1) {
      message = `🚨 ¡AYUDA A ENCONTRAR A ${pet.xName.toUpperCase()}! 🚨\n\n`;
      message += `📅 Perdido el: ${this.formatDate(currentReport.xIncidentDate)}\n`;
      message += `📍 Lugar: ${currentReport.xLastSeenLocation}\n`;
      message += `🐕 Tipo: ${pet.xType === 1 ? 'Perro' : 'Gato'}\n`;
      message += `🎨 Color: ${pet.xColorPrimary}\n`;

      if (currentReport.xRewardAmount > 0) {
        message += `💰 Recompensa: Bs. ${currentReport.xRewardAmount}\n`;
      }

      message += `\n📱 Si lo has visto, contacta al dueño urgentemente.\n`;
      message += `\n🔗 Ver información completa del reporte aquí:\n${petDetailUrl}\n`;
      message += `\n📲 Reportado desde Codly.pet - Plataforma para encontrar mascotas perdidas`;
    } else if (currentReport.xReportType === 2) {
      message = `✅ ¡MASCOTA ENCONTRADA! ✅\n\n`;
      message += `📅 Encontrado el: ${this.formatDate(currentReport.xIncidentDate)}\n`;
      message += `📍 Lugar: ${currentReport.xLastSeenLocation}\n`;
      message += `🐕 Descripción: ${pet.xType === 1 ? 'Perro' : 'Gato'}, ${pet.xColorPrimary}\n`;
      message += `\n📱 Si es tu mascota, contacta inmediatamente.\n`;
      message += `\n🔗 Ver detalles completos:\n${petDetailUrl}\n`;
      message += `\n📲 Información desde Codly.pet`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    this.snackBar.open('Mensaje preparado para compartir por WhatsApp', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }
}
