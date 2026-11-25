type GlobalSettings =
  | { settings?: Record<string, unknown> | null; [key: string]: unknown }
  | null
  | undefined;

export const isKlimaTalerConfigured = (globalSettings: GlobalSettings) => {
  const value = globalSettings?.settings?.['klima-taler'];
  return value === true || (typeof value === 'object' && value !== null && !Array.isArray(value));
};
