import type { MapMarker } from '../types/Map';

import type { KlimaTalerOfferLocation } from './offersTypes';

export const klimaTalerMarkerId = (id: number) => `klima-taler:${id}`;
export const isKlimaTalerMarker = (id?: string) => id?.startsWith('klima-taler:') === true;

// External locations share the POI map contract but never become backend POI IDs.
export const offersToMapMarkers = (
  locations: readonly KlimaTalerOfferLocation[],
  iconName: string
): MapMarker[] =>
  locations.map((location) => ({
    id: klimaTalerMarkerId(location.id),
    title: location.name,
    label: location.name,
    serviceName: 'Klima-Taler',
    iconName,
    [iconName]: 1,
    // The public feed has coordinates, not device GPS measurement metadata.
    position: {
      latitude: location.latitude,
      longitude: location.longitude
    } as MapMarker['position']
  }));

export const selectedOfferLocation = (locations: readonly KlimaTalerOfferLocation[], id?: string) =>
  locations.find((location) => klimaTalerMarkerId(location.id) === id);
