import { Injectable } from '@angular/core';
import type {
  PetColor,
  FurTypeOption,
  PetTypeOption,
  PetGenderOption,
  PetStatusOption,
  ReportStatusOption,
  ReportTypeOption,
} from '../models/pet';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  readonly predefinedColors: PetColor[] = [
    { id: 'negro', name: 'Negro', hexCode: '#1a1a1a', isCommon: true },
    { id: 'blanco', name: 'Blanco', hexCode: '#f5f5f5', isCommon: true },
    { id: 'marron', name: 'Marrón', hexCode: '#6b4423', isCommon: true },
    { id: 'dorado', name: 'Dorado', hexCode: '#d4a574', isCommon: true },
    { id: 'gris', name: 'Gris', hexCode: '#808080', isCommon: true },
    { id: 'beige', name: 'Beige', hexCode: '#d2b48c', isCommon: true },

    { id: 'chocolate', name: 'Chocolate', hexCode: '#3d2817', isCommon: false },
    { id: 'crema', name: 'Crema', hexCode: '#fffacd', isCommon: false },
    { id: 'canela', name: 'Canela', hexCode: '#a0522d', isCommon: false },
    { id: 'naranja', name: 'Naranja', hexCode: '#ff8c42', isCommon: false },
    { id: 'rojizo', name: 'Rojizo', hexCode: '#8b4513', isCommon: false },
    {
      id: 'tricolor',
      name: 'Tricolor',
      hexCode: 'linear-gradient(120deg, #1a1a1a 0%, #d4a574 50%, #f5f5f5 100%)',
      isCommon: false,
    },
    {
      id: 'atigrado',
      name: 'Atigrado',
      hexCode:
        'linear-gradient(90deg, #6b4423 0%, #3d2817 25%, #6b4423 50%, #3d2817 75%, #6b4423 100%)',
      isCommon: false,
    },
    {
      id: 'carey',
      name: 'Carey',
      hexCode: 'linear-gradient(135deg, #3d2817 0%, #ff8c42 50%, #1a1a1a 100%)',
      isCommon: false,
    },
    { id: 'azul_gris', name: 'Azul/Gris', hexCode: '#708090', isCommon: false },
    { id: 'plateado', name: 'Plateado', hexCode: '#c0c0c0', isCommon: false },
  ];

  readonly furTypes: FurTypeOption[] = [
    { value: 'corto', label: 'Pelo corto', description: 'Menos de 2cm' },
    { value: 'mediano', label: 'Pelo mediano', description: '2-5cm' },
    { value: 'largo', label: 'Pelo largo', description: 'Más de 5cm' },
    { value: 'rizado', label: 'Pelo rizado', description: 'Con ondas o rizos' },
    { value: 'liso', label: 'Pelo liso', description: 'Completamente liso' },
    { value: 'doble', label: 'Doble capa', description: 'Subpelo y pelo exterior' },
    { value: 'sin_pelo', label: 'Sin pelo', description: 'Raza sin pelaje' },
  ];

  readonly petTypes: PetTypeOption[] = [
    {
      value: 1,
      label: 'Perrito',
      icon: 'pets',
      image: '/pet/dog.png',
    },
    {
      value: 2,
      label: 'Gatito',
      icon: 'pets',
      image: '/pet/cat.png',
    },
  ];

  readonly genders: PetGenderOption[] = [
    { value: 1, label: 'Macho', icon: 'male' },
    { value: 2, label: 'Hembra', icon: 'female' },
  ];

  readonly petStatusOptions: PetStatusOption[] = [
    { value: 1, label: 'En casa', color: 'success', icon: 'home' },
    { value: 2, label: 'Perdida', color: 'warn', icon: 'search' },
    { value: 3, label: 'Encontrada', color: 'accent', icon: 'pets' },
    { value: 4, label: 'En Adopción', color: 'primary', icon: 'favorite' },
    { value: 5, label: 'Fallecida', color: '', icon: 'sentiment_very_dissatisfied' },
  ];

  readonly reportStatusOptions: ReportStatusOption[] = [
    { value: 1, label: 'Activo', color: 'warn', icon: 'search' },
    { value: 2, label: 'Resuelto', color: 'success', icon: 'check_circle' },
    { value: 3, label: 'Cancelado', color: '', icon: 'cancel' },
  ];

  readonly reportTypeOptions: ReportTypeOption[] = [
    { value: 1, label: 'Mascota Perdida', icon: 'report', color: 'warn' },
    { value: 2, label: 'Mascota Encontrada', icon: 'pets', color: 'accent' },
    { value: 3, label: 'En Adopción', icon: 'favorite', color: 'primary' },
  ];

  private readonly fieldLabels: { [key: string]: string } = {
    xName: 'El nombre de tu mascota',
    xType: 'El tipo de mascota',
    xBreed: 'La raza de tu mascota',
    xBirthDate: 'La fecha de nacimiento',
    xGender: 'El género de tu mascota',
    xDescription: 'La descripción de tu mascota',
    xFurType: 'El tipo de pelo',
    xColorPrimary: 'El color predominante',
    xColorSecondary: 'Los colores secundarios',

    xEmail: 'El email',
    xPhone: 'El teléfono',
    xDirection: 'La dirección',
    xStatus: 'El estado',

    xIdPet: 'Mascota',
    xIncidentDate: 'Fecha del incidente',
    xIncidentTime: 'Hora del incidente',
    xLastSeenLocation: 'Ubicación',
    xCircumstances: 'Circunstancias',
    xRewardAmount: 'Recompensa',
  };

  getCommonColors(): PetColor[] {
    return this.predefinedColors.filter((c) => c.isCommon);
  }

  getUncommonColors(): PetColor[] {
    return this.predefinedColors.filter((c) => !c.isCommon);
  }

  getColorName(colorId: string): string {
    return this.predefinedColors.find((c) => c.id === colorId)?.name || colorId;
  }

  getColorHex(colorId: string): string {
    return this.predefinedColors.find((c) => c.id === colorId)?.hexCode || '#808080';
  }

  getColorById(colorId: string): PetColor | undefined {
    return this.predefinedColors.find((c) => c.id === colorId);
  }

  calculateAgeFromBirthDate(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return Math.max(0, age);
  }

  getAgeStage(birthDate: Date): string {
    if (!birthDate) return '';

    const age = this.calculateAgeFromBirthDate(birthDate);

    if (age < 1) return 'Bebé';
    if (age <= 3) return 'Joven';
    if (age <= 8) return 'Adulto';
    return 'Senior';
  }

  formatAge(birthDate: Date | any): string {
    const date = this.convertToDate(birthDate);
    const age = this.calculateAgeFromBirthDate(date);
    if (age === 0) return 'Menos de 1 año';
    if (age === 1) return '1 año';
    return `${age} años`;
  }

  getPetTypeLabel(type: number): string {
    return this.petTypes.find((t) => t.value === type)?.label || 'Mascota';
  }

  getGenderLabel(gender: number): string {
    return this.genders.find((g) => g.value === gender)?.label || 'Desconocido';
  }

  getFurTypeLabel(furType: string): string {
    return this.furTypes.find((f) => f.value === furType)?.label || furType;
  }

  getPetStatusInfo(status: number | undefined): PetStatusOption {
    return this.petStatusOptions.find((s) => s.value === status) || this.petStatusOptions[0];
  }

  getPetStatusLabel(status: number | undefined): string {
    return this.getPetStatusInfo(status).label;
  }

  getReportStatusInfo(status: number | undefined): ReportStatusOption {
    return this.reportStatusOptions.find((s) => s.value === status) || this.reportStatusOptions[0];
  }

  getReportStatusLabel(status: number | undefined): string {
    return this.getReportStatusInfo(status).label;
  }

  getReportTypeInfo(type: number | undefined): ReportTypeOption {
    return this.reportTypeOptions.find((t) => t.value === type) || this.reportTypeOptions[0];
  }

  getReportTypeLabel(type: number | undefined): string {
    return this.getReportTypeInfo(type).label;
  }

  isValidBirthDate(birthDate: Date): boolean {
    const today = new Date();
    const birth = new Date(birthDate);
    const maxAge = 30;

    if (birth > today) return false;
    if (this.calculateAgeFromBirthDate(birth) > maxAge) return false;

    return true;
  }

  isValidColorSelection(colors: string[]): boolean {
    return colors.length >= 1 && colors.length <= 3;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getInvalidFields(formGroup: FormGroup): string[] {
    const errors: string[] = [];
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control?.invalid) {
        errors.push(this.getFieldLabel(key));
      }
    });
    return errors;
  }

  getFieldErrorMessage(fieldName: string, control: any): string {
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Ingresa un email válido';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return 'Formato inválido';
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es 0';
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    return this.fieldLabels[fieldName] || fieldName;
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateShort(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(date: Date | null | undefined): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getDefaultTime(): Date {
    const now = new Date();
    now.setHours(now.getHours(), now.getMinutes(), 0, 0);
    return now;
  }

  getMainPetImage(images: string[] | undefined, petType: number): string {
    if (images && images.length > 0) {
      return images[0];
    }
    return petType === 1
      ? 'https://placehold.co/300x300/E3F2FD/1976D2?text=🐕'
      : 'https://placehold.co/300x300/F3E5F5/7B1FA2?text=🐱';
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  getWhatsAppLink(phone: string, message?: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  }

  getPhoneLink(phone: string): string {
    return `tel:${phone}`;
  }

  getEmailLink(email: string, subject?: string, body?: string): string {
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    return `mailto:${email}${params.length ? '?' + params.join('&') : ''}`;
  }

  isValidBolivianPhone(phone: string): boolean {
    const pattern = /^(\+591)?[67]\d{7}$/;
    return pattern.test(phone.replace(/\s/g, ''));
  }

  isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 25 * 1024 * 1024;

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  generateImagePreviews(newFiles: File[], currentPreviews: string[]): Promise<string[]> {
    return new Promise((resolve) => {
      if (newFiles.length === 0) {
        resolve(currentPreviews);
        return;
      }

      const newPreviews: string[] = [];
      let processedCount = 0;

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          processedCount++;

          if (processedCount === newFiles.length) {
            resolve([...currentPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  generateImagePreviewsForEditing(newFiles: File[], existingUrls: string[]): Promise<string[]> {
    return new Promise((resolve) => {
      if (newFiles.length === 0) {
        resolve(existingUrls);
        return;
      }

      const newPreviews: string[] = [];
      let processedCount = 0;

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          processedCount++;

          if (processedCount === newFiles.length) {
            resolve([...existingUrls, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  validateFileSelection(
    newFiles: File[],
    currentCount: number,
    maxFiles: number = 5
  ): {
    validFiles: File[];
    invalidFiles: string[];
    availableSlots: number;
    hasError: boolean;
    errorMessage?: string;
  } {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    newFiles.forEach((file) => {
      if (this.isValidImageFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    const availableSlots = maxFiles - currentCount;
    let hasError = false;
    let errorMessage: string | undefined;

    if (validFiles.length > availableSlots) {
      hasError = true;
      errorMessage = `Solo puedes agregar ${availableSlots} foto(s) más. Máximo ${maxFiles} fotos.`;
      validFiles.splice(availableSlots);
    }

    if (invalidFiles.length > 0) {
      const invalidMessage = `Archivos inválidos: ${invalidFiles.join(
        ', '
      )}. Solo se permiten imágenes JPG, PNG, WEBP hasta 25MB.`;
      errorMessage = errorMessage ? `${errorMessage} ${invalidMessage}` : invalidMessage;
      hasError = true;
    }

    return {
      validFiles,
      invalidFiles,
      availableSlots,
      hasError,
      errorMessage,
    };
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode(
        {
          location: { lat, lng },
          language: 'es',
          region: 'BO',
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result =
              results.find(
                (r) =>
                  r.types.includes('street_address') ||
                  r.types.includes('premise') ||
                  r.types.includes('point_of_interest')
              ) || results[0];

            resolve(result.formatted_address);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  formatCoordinatesAsAddress(lat: number, lng: number): string {
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  }

  removeImageFromArrays(
    index: number,
    files: File[],
    previews: string[],
    isEditing: boolean = false
  ): { updatedFiles: File[]; updatedPreviews: string[] } {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];
    const previewToRemove = previews[index];

    if (isEditing && previewToRemove.startsWith('http')) {
      updatedPreviews.splice(index, 1);
    } else {
      const fileIndexToRemove = updatedFiles.findIndex((f) => f.size > 0);

      if (fileIndexToRemove !== -1) {
        updatedFiles.splice(fileIndexToRemove, 1);
      }

      updatedPreviews.splice(index, 1);
    }

    return {
      updatedFiles,
      updatedPreviews,
    };
  }

  convertToDate(dateValue: any): Date {
    if (!dateValue) {
      return new Date();
    }

    if (dateValue instanceof Date) {
      return dateValue;
    }

    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }

    if (typeof dateValue === 'string') {
      const parsedDate = new Date(dateValue);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }

    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }

    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    }

    return new Date();
  }
}
