import type { OffersQuery } from './offersTypes';
import { configurationObject } from './widgetConfiguration';

const inRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

export const resolveImportedOffersMap = (moduleSettings: unknown) => {
  const offers = configurationObject(configurationObject(moduleSettings).offers);
  if (offers.source !== 'mainserver') return undefined;
  const id = (value: unknown) =>
    (typeof value === 'string' || typeof value === 'number') && /^[1-9]\d*$/.test(String(value));
  return {
    // Both filters prevent incomplete instance settings from showing unrelated POIs.
    queryVariables:
      id(offers.dataProviderId) && id(offers.categoryId)
        ? { dataProviderId: String(offers.dataProviderId), categoryId: String(offers.categoryId) }
        : undefined
  };
};

// Use customer configuration or the existing town map center, never the device location.
export const resolveOffersQuery = (
  moduleSettings: unknown,
  mapCenter: unknown
): OffersQuery | null => {
  const options = configurationObject(configurationObject(moduleSettings).offers);
  const center = configurationObject(mapCenter);
  const radius = options.radius;
  const language = options.language ?? 'de';
  if (radius !== undefined && !inRange(radius, 0.5, 25)) return null;
  if (language !== 'de' && language !== 'en') return null;
  if (options.area !== undefined) {
    if (typeof options.area !== 'string' || !options.area.trim()) return null;
    return { area: options.area, ...(radius !== undefined ? { radius } : {}), language };
  }
  const { latitude, longitude } = center;
  if (!inRange(latitude, -90, 90) || !inRange(longitude, -180, 180)) return null;
  return { latitude, longitude, ...(radius !== undefined ? { radius } : {}), language };
};
