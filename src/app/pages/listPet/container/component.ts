import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { XNavbarComponent } from '../../../shared/navbar/container/component';
import { AuthService } from '../../../core/services/auth';
import { DataService } from '../../../core/services/data';
import { PetBreedsService } from '../../../core/services/breed';
import { XPet, PetStatusOption, FilterOption } from '../../../core/models/pet';
import { Observable, map, combineLatest } from 'rxjs';
import ReportDetailBottomSheetComponent from '../../detailReport/container/component';
import { UtilService } from '../../../core/services/util';

@Component({
  selector: 'x-pets-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    XNavbarComponent,
  ],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PetsListComponent extends UtilService {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private petBreedsService = inject(PetBreedsService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private bottomSheet = inject(MatBottomSheet);

  user = this.authService.user;

  selectedFilter = signal<string>('my-pets');

  filterOptions: FilterOption[] = [
    { value: 'my-pets', label: 'Mis mascotas' },
    { value: 'lost', label: 'Perdidas', statusCode: 2 },
    { value: 'found', label: 'Encontradas', statusCode: 3 },
    { value: 'adoption', label: 'En adopción', statusCode: 4 },
  ];

  private allPetsWithReports$ = combineLatest([
    this.dataService.getAllPets(),
    this.dataService.getAllReports(),
  ]).pipe(
    map(([pets, reports]) => {
      return pets.map((pet) => {
        const petReports = reports.filter((r) => {
          if (r instanceof Promise) {
            return false;
          }

          const matchesPet = r.xIdPet === pet.xId;
          const isActive = r.xStatus === 1;

          return matchesPet && isActive;
        });

        return {
          ...pet,
          activeReports: petReports,
          hasActiveReport: petReports.length > 0,
        };
      });
    })
  );

  allPets = toSignal(this.allPetsWithReports$, { initialValue: [] });

  filteredPets = computed(() => {
    const allPetsData = this.allPets();
    const filter = this.selectedFilter();
    const currentUserId = this.user()?.uid;

    if (filter === 'my-pets') {
      return allPetsData.filter((pet) => pet.xIdUser === currentUserId);
    }

    const selectedOption = this.filterOptions.find((f) => f.value === filter);
    if (selectedOption?.statusCode) {
      return allPetsData.filter((pet) => pet.xCurrentStatus === selectedOption.statusCode);
    }

    return [];
  });

  setFilter(value: string): void {
    this.selectedFilter.set(value);
  }

  isOwner(pet: XPet): boolean {
    return pet.xIdUser === this.user()?.uid;
  }

  openReportDetail(pet: any): void {
    if (!pet.hasActiveReport || !pet.activeReports?.length) {
      this.snackBar.open('No hay reportes activos para esta mascota', 'Cerrar', { duration: 2000 });
      return;
    }

    const report = pet.activeReports[0];

    this.bottomSheet.open(ReportDetailBottomSheetComponent, {
      data: {
        report,
        pet,
        isOwner: this.isOwner(pet),
      },
      hasBackdrop: true,
      disableClose: false,
    });
  }

  reportPetAsLost(pet: XPet): void {
    if (pet.xCurrentStatus !== 1) {
      this.snackBar.open(
        `${pet.xName} no está en estado "En casa", no se puede reportar como perdida.`,
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    this.router.navigate(['/reports/create', pet.xId]);
  }

  showAdoptionInterest(pet: XPet): void {
    this.bottomSheet.open(ReportDetailBottomSheetComponent, {
      data: {
        pet,
        isAdoptionInquiry: true,
        isOwner: false,
      },
      hasBackdrop: true,
      disableClose: false,
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

  getPetMainImage(pet: XPet): string {
    return this.getMainPetImage(pet.xImage, pet.xType);
  }
}
