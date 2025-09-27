import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private storage = inject(Storage);

  uploadPetImages(files: File[], petId: string, userId: string): Observable<string[]> {
    const uploadPromises = files.map((file, index) => {
      const timestamp = Date.now();
      const fileName = `pet_${petId}_${index}_${timestamp}.${this.getFileExtension(file.name)}`;
      const filePath = `pets/${userId}/${petId}/${fileName}`;
      const storageRef = ref(this.storage, filePath);

      return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
    });

    return from(Promise.all(uploadPromises));
  }

  uploadPetImage(file: File, petId: string, userId: string): Observable<string> {
    const timestamp = Date.now();
    const fileName = `pet_${petId}_${timestamp}.${this.getFileExtension(file.name)}`;
    const filePath = `pets/${userId}/${petId}/${fileName}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef)));
  }

  deleteImage(imageUrl: string): Observable<void> {
    const storageRef = ref(this.storage, imageUrl);
    return from(deleteObject(storageRef));
  }

  validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 25 * 1024 * 1024;

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || 'jpg';
  }

  async resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.9
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
