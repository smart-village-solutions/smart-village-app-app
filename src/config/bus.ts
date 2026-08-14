export const FEDERAL_STATE_CODES = [
  'BB',
  'BE',
  'BW',
  'BY',
  'HB',
  'HE',
  'HH',
  'MV',
  'NI',
  'NW',
  'RP',
  'SH',
  'SL',
  'SN',
  'ST',
  'TH'
] as const;

export type FederalStateCode = (typeof FEDERAL_STATE_CODES)[number];

export const normalizeBusFederalState = (value: unknown): FederalStateCode => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(
      'BUS configuration requires settings.bus.federalState for generic API requests'
    );
  }

  const normalizedValue = value.trim().toUpperCase();

  if (!FEDERAL_STATE_CODES.includes(normalizedValue as FederalStateCode)) {
    throw new Error(`Invalid settings.bus.federalState: ${normalizedValue}`);
  }

  return normalizedValue as FederalStateCode;
};
