export type ConstructionSite = {
  category?: string;
  cause?: string;
  description?: string;
  direction?: string;
  endDate?: string;
  location?: {
    lat: number;
    lon: number;
  };
  locationDescription?: string;
  restrictions?: string[];
  startDate: string;
  title: string;
};
