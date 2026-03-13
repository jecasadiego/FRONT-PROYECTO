export type ActivityFilter = "all" | "active" | "inactive";

export interface TimestampedEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Genre extends TimestampedEntity {
  name: string;
  isActive: boolean;
  description: string | null;
}

export interface Director extends TimestampedEntity {
  names: string;
  isActive: boolean;
}

export interface Producer extends TimestampedEntity {
  name: string;
  isActive: boolean;
  slogan: string | null;
  description: string | null;
}

export interface TypeEntity extends TimestampedEntity {
  name: string;
  description: string | null;
}

export interface MediaGenre {
  id: number;
  name: string;
  isActive: boolean;
}

export interface MediaDirector {
  id: number;
  names: string;
  isActive: boolean;
}

export interface MediaProducer {
  id: number;
  name: string;
  isActive: boolean;
}

export interface MediaType {
  id: number;
  name: string;
}

export interface MediaItem extends TimestampedEntity {
  serial: string;
  title: string;
  synopsis: string;
  url: string;
  coverImage: string;
  releaseYear: number;
  genreId: number;
  directorId: number;
  producerId: number;
  typeId: number;
  genre: MediaGenre;
  director: MediaDirector;
  producer: MediaProducer;
  type: MediaType;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface HealthCheck {
  success: boolean;
  message: string;
  timestamp: string;
}
