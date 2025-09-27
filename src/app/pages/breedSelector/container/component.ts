import {
  Component,
  inject,
  signal,
  computed,
  Inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PetBreedsService } from '../../../core/services/breed';
import { PetBreed } from '../../../core/models/pet';
import { UtilService } from '../../../core/services/util';

@Component({
  selector: 'x-breed-selector',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreedSelectorComponent extends UtilService {
  private bottomSheetRef = inject(MatBottomSheetRef<BreedSelectorComponent>);
  private breedService = inject(PetBreedsService);

  searchQuery = signal('');

  breeds: PetBreed[] = [];

  filteredBreeds = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return this.breeds;
    }

    return this.breeds.filter(
      (breed) =>
        breed.nameEs.toLowerCase().includes(query) ||
        breed.name.toLowerCase().includes(query) ||
        breed.characteristics.some((c) => c.toLowerCase().includes(query)) ||
        breed.temperament.some((t) => t.toLowerCase().includes(query))
    );
  });

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { petType: number }) {
    super();
    this.breeds = this.breedService.getBreedsByType(data.petType);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  selectBreed(breed: PetBreed): void {
    this.bottomSheetRef.dismiss(breed);
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}
