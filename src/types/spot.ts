export interface Spot {
  id: string;
  title: string;
  notes: string;
  imageUri?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  createdAt: number;
  updatedAt: number;
}
