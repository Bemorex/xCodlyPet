export interface XUser {
  xId: string; // ID único del usuario (UUID)
  xName: string; // Nombre completo del usuario
  xEmail: string; // Email para login y comunicaciones
  xPhone?: string; // Teléfono de contacto principal
  xPhoto?: string; // URL de foto de perfil del usuario
  xDirection?: string; // Dirección completa del usuario
  xStatus: number; // 1=active, 2=inactive, 3=suspended

  xUid?: string; // Firebase UID
  xDisplayName?: string | null; // Display name de Firebase
  xPhotoURL?: string | null; // Photo URL de Firebase
}
