export type ConstructionSite = {
  id: string;
  category?: string;
  cause?: string;
  description?: string;
  direction?: string;
  endDate?: string;
  imageUri?: string;
  location?: {
    lat: number;
    lon: number;
  };
  locationDescription?: string;
  restrictions?: string[];
  startDate: string;
  title: string;
};
