import { Injectable, signal } from '@angular/core';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  center = signal<google.maps.LatLngLiteral>({ lat: -17.9647, lng: -67.1073 }); // Oruro, Bolivia
  zoom = signal(13);
  markerPosition = signal<google.maps.LatLngLiteral | null>(null);
  isLoading = signal(false);

  private currentMarker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null =
    null;
  private markersMap = new Map<
    string,
    google.maps.marker.AdvancedMarkerElement | google.maps.Marker
  >();

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está disponible en este dispositivo.'));
        return;
      }

      this.isLoading.set(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          this.center.set({ lat, lng });
          this.markerPosition.set({ lat, lng });
          this.zoom.set(16);

          try {
            const address = await this.reverseGeocode(lat, lng);
            const locationData: LocationData = {
              latitude: lat,
              longitude: lng,
              address: address,
              accuracy: accuracy,
            };

            this.isLoading.set(false);
            resolve(locationData);
          } catch (error) {
            const locationData: LocationData = {
              latitude: lat,
              longitude: lng,
              address: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              accuracy: accuracy,
            };

            this.isLoading.set(false);
            resolve(locationData);
          }
        },
        (error) => {
          this.isLoading.set(false);

          let errorMessage = 'No se pudo obtener la ubicación actual.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado por el usuario.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado para obtener ubicación.';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    });
  }

  async handleMapClick(event: google.maps.MapMouseEvent): Promise<LocationData | null> {
    if (!event.latLng) return null;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    this.markerPosition.set({ lat, lng });

    try {
      const address = await this.reverseGeocode(lat, lng);
      return {
        latitude: lat,
        longitude: lng,
        address: address,
      };
    } catch (error) {
      return {
        latitude: lat,
        longitude: lng,
        address: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
    }
  }

  createAdvancedMarker(
    map: google.maps.Map,
    position: google.maps.LatLngLiteral,
    options?: {
      id?: string;
      title?: string;
      content?: HTMLElement;
      gmpDraggable?: boolean;
      color?: string;
      icon?: string;
    }
  ): google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null {
    try {
      if (google.maps.marker?.AdvancedMarkerElement) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: map,
          position: position,
          title: options?.title || 'Marcador',
          content: options?.content,
          gmpDraggable: options?.gmpDraggable || false,
        });

        if (options?.id) {
          this.markersMap.set(options.id, marker);
        }

        this.currentMarker = marker;
        return marker;
      } else {
        return this.createClassicMarker(map, position, options);
      }
    } catch (error) {
      return this.createClassicMarker(map, position, options);
    }
  }

  createCustomMarker(
    map: google.maps.Map,
    position: google.maps.LatLngLiteral,
    options: {
      id?: string;
      title?: string;
      color?: string;
      icon?: string;
      size?: number;
      gmpDraggable?: boolean;
    }
  ): google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null {
    const size = options.size || 30;
    const color = options.color || '#EA4335';
    const icon = options.icon || '📍';

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-location-marker';
    markerElement.innerHTML = `
      <div style="
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        color: white;
        font-weight: bold;
        font-size: ${Math.floor(size * 0.6)}px;
        transition: transform 0.2s ease;
      ">
        ${icon}
      </div>
    `;

    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.1)';
    });

    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)';
    });

    return this.createAdvancedMarker(map, position, {
      id: options.id,
      title: options.title,
      content: markerElement,
      gmpDraggable: options.gmpDraggable,
    });
  }

  private createClassicMarker(
    map: google.maps.Map,
    position: google.maps.LatLngLiteral,
    options?: {
      id?: string;
      title?: string;
      color?: string;
      icon?: string;
      size?: number;
      gmpDraggable?: boolean;
    }
  ): google.maps.Marker {
    const color = options?.color || '#EA4335';
    const icon = options?.icon || '📍';
    const size = options?.size || 30;

    const svgIcon = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${
      size / 2 - 2
    }" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="${size / 2}" y="${
      size / 2 + 5
    }" text-anchor="middle" fill="white" font-size="${Math.floor(
      size * 0.6
    )}" font-weight="bold">${icon}</text>
      </svg>
    `;

    const marker = new google.maps.Marker({
      map: map,
      position: position,
      title: options?.title || 'Marcador',
      draggable: options?.gmpDraggable || false,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      },
    });

    if (options?.id) {
      this.markersMap.set(options.id, marker);
    }

    this.currentMarker = marker;
    return marker;
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
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
            const specificResult = results.find(
              (result) =>
                result.types.includes('street_address') ||
                result.types.includes('premise') ||
                result.types.includes('point_of_interest') ||
                result.types.includes('establishment')
            );

            const selectedResult = specificResult || results[0];
            resolve(selectedResult.formatted_address);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  setLocation(lat: number, lng: number, zoom: number = 16): void {
    this.center.set({ lat, lng });
    this.markerPosition.set({ lat, lng });
    this.zoom.set(zoom);
  }

  clearLocation(): void {
    this.markerPosition.set(null);
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

  getMarker(id?: string): google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null {
    if (id && this.markersMap.has(id)) {
      return this.markersMap.get(id) || null;
    }
    return this.currentMarker;
  }

  supportsAdvancedMarkers(): boolean {
    return !!(google.maps.marker && google.maps.marker.AdvancedMarkerElement);
  }
}
