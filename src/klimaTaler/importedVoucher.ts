// A local voucher ID is never the Changers offer ID. Imported stock is not a local quota.
export type ImportedKlimaTalerVoucher = {
  schemaVersion: 1;
  environment: 'stage' | 'production';
  redemptionMode: 'provider';
  locationId: number;
  offerId: number;
  cost: number;
  remaining: number;
  deeplink: string;
};

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const positiveId = (value: unknown) => Number.isSafeInteger(value) && (value as number) > 0;
const nonnegativeNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const quantity = (value: unknown) => Number.isSafeInteger(value) && (value as number) >= 0;

export const isImportedKlimaTalerVoucher = (payload: unknown) =>
  object(payload) && Object.prototype.hasOwnProperty.call(payload, 'klimaTaler');

export const readImportedKlimaTalerVoucher = (
  payload: unknown
): ImportedKlimaTalerVoucher | undefined => {
  const value = object(payload) ? payload.klimaTaler : undefined;
  if (!object(value)) return undefined;
  if (
    value.schemaVersion !== 1 ||
    !['stage', 'production'].includes(value.environment as string) ||
    value.redemptionMode !== 'provider' ||
    !positiveId(value.locationId) ||
    !positiveId(value.offerId) ||
    !nonnegativeNumber(value.cost) ||
    !quantity(value.remaining) ||
    value.deeplink !== `https://open.klima-taler.com/offers/${value.offerId}`
  )
    return undefined;
  return value as ImportedKlimaTalerVoucher;
};
