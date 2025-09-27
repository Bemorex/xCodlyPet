export interface XPet {
  xId: string; // ID único de la mascota (UUID)
  xIdUser: string; // Referencia al dueño que registró
  xName: string; // Nombre de la mascota
  xType: number; // 1=dog, 2=cat
  xBreed: string; // ID de raza (ej: "golden_retriever", "persian_cat")
  xBirthDate: Date; // Fecha de nacimiento
  xGender: number; // 1=male, 2=female (eliminado 3=unknown)
  xColorPrimary: string; // Color principal del pelaje (será un chip seleccionado)
  xColorSecondary?: string[]; // Colores secundarios (array de chips)
  xDescription: string; // Descripción general de personalidad y comportamiento
  xImage: string[]; // Array de URLs de fotos de la mascota
  xCurrentStatus?: number; // 1=safe_home, 2=lost, 3=found, 4=adopted, 5=deceased
  xCreatedAt?: Date; // Fecha de registro
  xUpdatedAt?: Date; // Fecha de última actualización

  // Nuevos campos
  xHasPedigree: boolean; // ¿Tiene pedigree?
  xFurType: string; // Tipo de pelo
  xIsDeceased: boolean; // ¿Ha fallecido?
  xIsNeutered: boolean; // ¿Está castrado/esterilizado?
}

// Interfaces para los selectores
export interface PetTypeOption {
  value: number;
  label: string;
  icon: string;
  image?: string;
}

export interface PetGenderOption {
  value: number;
  label: string;
  icon: string;
}

export interface PetStatusOption {
  value: number;
  label: string;
  color: string;
  icon: string;
}

export interface PetColor {
  id: string;
  name: string;
  hexCode: string;
  isCommon: boolean;
}

export interface FurTypeOption {
  value: string;
  label: string;
  description: string;
}

export interface XPetReport {
  xId: string;
  xIdPet: string;
  xIdUser: string;
  xReportType: number;
  xIncidentDate: Date;
  xIncidentTime: string;
  xLastSeenLocation: string;
  xLatitude: number;
  xLongitude: number;
  xCircumstances: string;
  xRewardAmount: number;
  xImages: string[];
  xStatus: number;
  xCreatedAt: Date;
  xResolvedAt?: Date;

  xPetInfo?: {
    xName: string;
    xType: number;
    xImage: string[];
    xColorPrimary: string;
    xBirthDate: Date;
  };

  xUserInfo?: {
    xName: string;
    xEmail: string;
    xPhone?: string;
  };
}

export interface XSighting {
  xId: string;
  xIdReport: string;
  xIdPet: string;
  xReporterName: string;
  xReporterEmail: string;
  xReporterPhone?: string;
  xSightingDate: Date;
  xSightingTime: string;
  xSightingLocation: string;
  xLatitude: number;
  xLongitude: number;
  xDescription: string;
  xPetCondition: string;
  xSightingImage?: string;
  xConfidenceLevel: number;
  xDistanceFromLastSeen: number;
  xFollowUpNeeded: boolean;
  xStatus: number;
  xCreatedAt: Date;
}

export interface ReportTypeOption {
  value: number;
  label: string;
  icon: string;
  color: string;
}

export interface ReportStatusOption {
  value: number;
  label: string;
  icon: string;
  color: string;
}

export interface SightingStatusOption {
  value: number;
  label: string;
  icon: string;
  color: string;
}

export interface ConfidenceLevelOption {
  value: number;
  label: string;
  description: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
}
export interface PetBreed {
  id: string;
  name: string;
  nameEs: string;
  type: number; // 1=dog, 2=cat
  image: string;
  characteristics: string[];
  size?: 'small' | 'medium' | 'large' | 'extra_large'; // Solo para perros principalmente
  temperament: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  statusCode?: number;
}
