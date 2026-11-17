import type { LocationObjectCoords } from 'expo-location';

import appJson from '../../app.json';
import { texts } from '../config/texts';

export type SueAddress = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
};

export const SUE_CITY_KEYS = [
  'city',
  'town',
  'village',
  'municipality',
  'city_district',
  'county',
  'suburb'
] as const;

const normalizeAddressPart = (value?: string) =>
  typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase() : '';

const normalizePostalCode = (value?: string) =>
  typeof value === 'string' ? value.replace(/\s+/g, '') : '';

export const isSuePostalCodeAllowed = (postalCode: string, allowedPostalCodes: string[]) =>
  !!normalizePostalCode(postalCode) &&
  allowedPostalCodes.some(
    (value) => normalizePostalCode(value) === normalizePostalCode(postalCode)
  );

export const getSueAddressKey = ({ street, houseNumber, postalCode, city }: SueAddress) =>
  JSON.stringify([street, houseNumber, postalCode, city].map(normalizeAddressPart));

const ROAD_KEYS = ['road', 'pedestrian', 'residential', 'footway', 'cycleway', 'path'] as const;

type SearchResult = {
  address?: Partial<
    Record<
      (typeof SUE_CITY_KEYS)[number] | (typeof ROAD_KEYS)[number] | 'house_number' | 'postcode',
      string
    >
  >;
  lat?: string;
  lon?: string;
};

const matchesAddress = (address: SearchResult['address'], input: SueAddress) =>
  !!address &&
  normalizePostalCode(address.postcode) === normalizePostalCode(input.postalCode) &&
  SUE_CITY_KEYS.some(
    (key) => normalizeAddressPart(address[key]) === normalizeAddressPart(input.city)
  ) &&
  ROAD_KEYS.some(
    (key) => normalizeAddressPart(address[key]) === normalizeAddressPart(input.street)
  ) &&
  (!input.houseNumber.trim() ||
    normalizeAddressPart(address.house_number) === normalizeAddressPart(input.houseNumber));

const getCoordinate = (value?: string) =>
  Number(typeof value === 'string' && value.trim() ? value : Number.NaN);

const GEOCODE_TIMEOUT_MS = 10_000;

export const withSueLocationTimeout = async <T>(operation: (signal: AbortSignal) => Promise<T>) => {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(texts.sue.report.alerts.locationTimeout));
      controller.abort();
    }, GEOCODE_TIMEOUT_MS);
  });

  try {
    const result = operation(controller.signal);

    return await Promise.race([result, deadline]);
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchSueGeocode = (url: string) =>
  withSueLocationTimeout((signal) =>
    fetch(url, {
      signal,
      headers: { 'User-Agent': `${appJson.expo.scheme}/${appJson.expo.version}` }
    }).then((response) => (response.ok ? response.json() : undefined))
  );

export const geocodeSueAddress = async (
  input: SueAddress,
  allowedPostalCodes?: string[]
): Promise<Pick<LocationObjectCoords, 'latitude' | 'longitude'> | undefined> => {
  const { street, houseNumber, postalCode, city } = input;
  const postcode = normalizePostalCode(postalCode);

  if (
    ![street.trim(), city.trim(), postcode].every(Boolean) ||
    (allowedPostalCodes && !isSuePostalCodeAllowed(postcode, allowedPostalCodes))
  ) {
    return;
  }

  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    street: [street.trim(), houseNumber.trim()].filter(Boolean).join(' '),
    city: city.trim(),
    postalcode: postcode,
    countrycodes: 'de'
  });
  const results = await fetchSueGeocode(`https://nominatim.openstreetmap.org/search?${params}`);
  if (!Array.isArray(results)) return;

  for (const result of results as SearchResult[]) {
    if (!matchesAddress(result?.address, input)) continue;

    const latitude = getCoordinate(result.lat);
    const longitude = getCoordinate(result.lon);
    if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
      return { latitude, longitude };
    }
  }
};
