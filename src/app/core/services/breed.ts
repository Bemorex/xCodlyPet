import { PetBreed } from './../models/pet';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PetBreedsService {
  private dogBreeds: PetBreed[] = [
    {
      id: 'golden_retriever',
      name: 'Golden Retriever',
      nameEs: 'Golden Retriever',
      type: 1,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      size: 'large',
      characteristics: ['Pelo largo y dorado', 'Tamaño grande', 'Muy amigable'],
      temperament: ['Amigable', 'Inteligente', 'Devoto'],
    },
    {
      id: 'labrador_retriever',
      name: 'Labrador Retriever',
      nameEs: 'Labrador',
      type: 1,
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop',
      size: 'large',
      characteristics: ['Pelo corto', 'Constitución atlética', 'Cola gruesa'],
      temperament: ['Amigable', 'Activo', 'Extrovertido'],
    },
    {
      id: 'german_shepherd',
      name: 'German Shepherd',
      nameEs: 'Pastor Alemán',
      type: 1,
      image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop',
      size: 'large',
      characteristics: ['Orejas erectas', 'Pelaje denso', 'Constitución robusta'],
      temperament: ['Confiado', 'Valiente', 'Versátil'],
    },
    {
      id: 'french_bulldog',
      name: 'French Bulldog',
      nameEs: 'Bulldog Francés',
      type: 1,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
      size: 'small',
      characteristics: ['Orejas de murciélago', 'Cara chata', 'Cuerpo compacto'],
      temperament: ['Adaptable', 'Juguetón', 'Inteligente'],
    },
    {
      id: 'bulldog_english',
      name: 'English Bulldog',
      nameEs: 'Bulldog Inglés',
      type: 1,
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop',
      size: 'medium',
      characteristics: ['Cara arrugada', 'Cuerpo rechoncho', 'Patas cortas'],
      temperament: ['Amistoso', 'Valiente', 'Tranquilo'],
    },
    {
      id: 'poodle',
      name: 'Poodle',
      nameEs: 'Caniche',
      type: 1,
      image: 'https://images.unsplash.com/photo-1616190173165-c2f3cca0a4d6?w=400&h=300&fit=crop',
      size: 'medium',
      characteristics: ['Pelo rizado', 'Hipoalergénico', 'Elegante'],
      temperament: ['Activo', 'Alerta', 'Inteligente'],
    },
    {
      id: 'beagle',
      name: 'Beagle',
      nameEs: 'Beagle',
      type: 1,
      image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop',
      size: 'medium',
      characteristics: ['Orejas largas', 'Tricolor', 'Tamaño mediano'],
      temperament: ['Amigable', 'Curioso', 'Feliz'],
    },
    {
      id: 'rottweiler',
      name: 'Rottweiler',
      nameEs: 'Rottweiler',
      type: 1,
      image: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400&h=300&fit=crop',
      size: 'large',
      characteristics: ['Negro con marcas café', 'Muy robusto', 'Cabeza grande'],
      temperament: ['Confiado', 'Valiente', 'Tranquilo'],
    },
    {
      id: 'yorkshire_terrier',
      name: 'Yorkshire Terrier',
      nameEs: 'Yorkshire Terrier',
      type: 1,
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop',
      size: 'small',
      characteristics: ['Muy pequeño', 'Pelo largo sedoso', 'Azul y fuego'],
      temperament: ['Afectuoso', 'Enérgico', 'Valiente'],
    },
    {
      id: 'chihuahua',
      name: 'Chihuahua',
      nameEs: 'Chihuahua',
      type: 1,
      image: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop',
      size: 'small',
      characteristics: ['Muy pequeño', 'Cabeza tipo manzana', 'Ojos grandes'],
      temperament: ['Alerta', 'Rápido', 'Devoto'],
    },
    {
      id: 'dachshund',
      name: 'Dachshund',
      nameEs: 'Salchicha',
      type: 1,
      image: 'https://images.unsplash.com/photo-1518880024751-6d1dda6ac0bb?w=400&h=300&fit=crop',
      size: 'small',
      characteristics: ['Cuerpo alargado', 'Patas cortas', 'Varias variedades de pelo'],
      temperament: ['Curioso', 'Amigable', 'Enérgico'],
    },
    {
      id: 'siberian_husky',
      name: 'Siberian Husky',
      nameEs: 'Husky Siberiano',
      type: 1,
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop',
      size: 'large',
      characteristics: ['Ojos azules o multicolor', 'Doble pelaje', 'Máscara facial'],
      temperament: ['Amigable', 'Gentil', 'Alerta'],
    },
    {
      id: 'border_collie',
      name: 'Border Collie',
      nameEs: 'Border Collie',
      type: 1,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      size: 'medium',
      characteristics: ['Muy inteligente', 'Pelo mediano', 'Bicolor común'],
      temperament: ['Enérgico', 'Inteligente', 'Responsivo'],
    },
    {
      id: 'boxer',
      name: 'Boxer',
      nameEs: 'Boxer',
      type: 1,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
      size: 'large',
      characteristics: ['Cabeza cuadrada', 'Mandíbula inferior prominente', 'Atlético'],
      temperament: ['Divertido', 'Brillante', 'Activo'],
    },
    {
      id: 'cocker_spaniel',
      name: 'Cocker Spaniel',
      nameEs: 'Cocker Spaniel',
      type: 1,
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop',
      size: 'medium',
      characteristics: ['Orejas largas y sedosas', 'Pelo ondulado', 'Expresión dulce'],
      temperament: ['Gentil', 'Inteligente', 'Feliz'],
    },
    {
      id: 'mestizo',
      name: 'Mixed Breed',
      nameEs: 'Mestizo',
      type: 1,
      image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=300&fit=crop',
      characteristics: ['Características variadas', 'Único', 'Saludable'],
      temperament: ['Variable', 'Único', 'Adorable'],
    },
  ];

  private catBreeds: PetBreed[] = [
    {
      id: 'persian',
      name: 'Persian',
      nameEs: 'Persa',
      type: 2,
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
      characteristics: ['Pelo largo y sedoso', 'Cara chata', 'Ojos grandes'],
      temperament: ['Tranquilo', 'Dulce', 'Gentil'],
    },
    {
      id: 'maine_coon',
      name: 'Maine Coon',
      nameEs: 'Maine Coon',
      type: 2,
      image: 'https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf?w=400&h=300&fit=crop',
      characteristics: ['Muy grande', 'Pelo semi-largo', 'Orejas con mechones'],
      temperament: ['Amigable', 'Inteligente', 'Gentil'],
    },
    {
      id: 'siamese',
      name: 'Siamese',
      nameEs: 'Siamés',
      type: 2,
      image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop',
      characteristics: ['Puntos de color', 'Cuerpo esbelto', 'Ojos azules'],
      temperament: ['Activo', 'Vocal', 'Social'],
    },
    {
      id: 'ragdoll',
      name: 'Ragdoll',
      nameEs: 'Ragdoll',
      type: 2,
      image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=300&fit=crop',
      characteristics: ['Muy grande', 'Pelo semi-largo', 'Ojos azules'],
      temperament: ['Tranquilo', 'Gentil', 'Relajado'],
    },
    {
      id: 'british_shorthair',
      name: 'British Shorthair',
      nameEs: 'Pelo Corto Británico',
      type: 2,
      image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=300&fit=crop',
      characteristics: ['Cuerpo robusto', 'Pelo denso', 'Cara redonda'],
      temperament: ['Tranquilo', 'Fácil de llevar', 'Leal'],
    },
    {
      id: 'abyssinian',
      name: 'Abyssinian',
      nameEs: 'Abisinio',
      type: 2,
      image: 'https://images.unsplash.com/photo-1548546738-8509aa4946b8?w=400&h=300&fit=crop',
      characteristics: ['Pelo corto tickeado', 'Orejas grandes', 'Atlético'],
      temperament: ['Activo', 'Inteligente', 'Juguetón'],
    },
    {
      id: 'bengal',
      name: 'Bengal',
      nameEs: 'Bengalí',
      type: 2,
      image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop',
      characteristics: ['Patrón de leopardo', 'Muy activo', 'Musculoso'],
      temperament: ['Enérgico', 'Alerta', 'Curioso'],
    },
    {
      id: 'russian_blue',
      name: 'Russian Blue',
      nameEs: 'Azul Ruso',
      type: 2,
      image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=300&fit=crop',
      characteristics: ['Pelo azul plateado', 'Ojos verdes', 'Elegante'],
      temperament: ['Gentil', 'Tranquilo', 'Tímido'],
    },
    {
      id: 'scottish_fold',
      name: 'Scottish Fold',
      nameEs: 'Fold Escocés',
      type: 2,
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
      characteristics: ['Orejas dobladas', 'Cara redonda', 'Ojos grandes'],
      temperament: ['Tranquilo', 'Amigable', 'Adaptable'],
    },
    {
      id: 'sphynx',
      name: 'Sphynx',
      nameEs: 'Esfinge',
      type: 2,
      image: 'https://images.unsplash.com/photo-1541599468348-e96984315929?w=400&h=300&fit=crop',
      characteristics: ['Sin pelo', 'Piel arrugada', 'Muy cariñoso'],
      temperament: ['Extrovertido', 'Enérgico', 'Social'],
    },
    {
      id: 'munchkin',
      name: 'Munchkin',
      nameEs: 'Munchkin',
      type: 2,
      image: 'https://images.unsplash.com/photo-1559235038-1b0fadf27888?w=400&h=300&fit=crop',
      characteristics: ['Patas cortas', 'Cuerpo normal', 'Muy juguetón'],
      temperament: ['Juguetón', 'Extrovertido', 'Inteligente'],
    },
    {
      id: 'norwegian_forest',
      name: 'Norwegian Forest Cat',
      nameEs: 'Bosque de Noruega',
      type: 2,
      image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400&h=300&fit=crop',
      characteristics: ['Pelo largo', 'Muy grande', 'Robusto'],
      temperament: ['Tranquilo', 'Inteligente', 'Adaptable'],
    },
    {
      id: 'american_shorthair',
      name: 'American Shorthair',
      nameEs: 'Pelo Corto Americano',
      type: 2,
      image: 'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=400&h=300&fit=crop',
      characteristics: ['Pelo corto', 'Cuerpo mediano', 'Muy resistente'],
      temperament: ['Tranquilo', 'Fácil de cuidar', 'Amigable'],
    },
    {
      id: 'oriental',
      name: 'Oriental',
      nameEs: 'Oriental',
      type: 2,
      image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=300&fit=crop',
      characteristics: ['Cuerpo esbelto', 'Orejas grandes', 'Muchos colores'],
      temperament: ['Activo', 'Vocal', 'Social'],
    },
    {
      id: 'mestizo_cat',
      name: 'Mixed Breed',
      nameEs: 'Mestizo',
      type: 2,
      image: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=400&h=300&fit=crop',
      characteristics: ['Características variadas', 'Único', 'Saludable'],
      temperament: ['Variable', 'Único', 'Adorable'],
    },
  ];

  getDogBreeds(): PetBreed[] {
    return this.dogBreeds;
  }

  getCatBreeds(): PetBreed[] {
    return this.catBreeds;
  }

  getBreedsByType(petType: number): PetBreed[] {
    if (petType === 1) {
      return this.getDogBreeds();
    } else if (petType === 2) {
      return this.getCatBreeds();
    }
    return [];
  }

  getBreedById(breedId: string): PetBreed | undefined {
    const allBreeds = [...this.dogBreeds, ...this.catBreeds];
    return allBreeds.find((breed) => breed.id === breedId);
  }

  searchBreeds(query: string, petType?: number): PetBreed[] {
    const breeds = petType ? this.getBreedsByType(petType) : [...this.dogBreeds, ...this.catBreeds];
    const lowerQuery = query.toLowerCase();

    return breeds.filter(
      (breed) =>
        breed.name.toLowerCase().includes(lowerQuery) ||
        breed.nameEs.toLowerCase().includes(lowerQuery)
    );
  }
}
