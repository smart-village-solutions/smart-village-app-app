export type Address = {
  addition?: string;
  city?: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
  kind?: string;
  street?: string;
  zip?: string;
};
