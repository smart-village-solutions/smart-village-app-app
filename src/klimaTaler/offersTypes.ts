export type OffersEnvironment = 'stage' | 'production';

export type OffersQuery = (
  | { area: string; latitude?: never; longitude?: never }
  | { area?: never; latitude: number; longitude: number }
) & { radius?: number; language?: 'de' | 'en' };

export type KlimaTalerOffer = {
  readonly id: number;
  readonly title: string;
  readonly cost: number;
  readonly remaining: number;
  readonly offer_type_id: 1 | 2;
  readonly image: string | null;
  readonly deeplink: string;
};

export type KlimaTalerOfferLocation = {
  readonly id: number;
  readonly name: string;
  readonly image: string;
  readonly address: string | null;
  readonly postal_code: string | null;
  readonly city: string | null;
  readonly type: string;
  readonly icon_active: string;
  readonly icon_inactive: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly distance_km: number;
  readonly offers: readonly KlimaTalerOffer[];
};

export type KlimaTalerOffers = {
  readonly center: { readonly latitude: number; readonly longitude: number };
  readonly radius_km: number;
  readonly count: number;
  readonly locations: readonly KlimaTalerOfferLocation[];
};
