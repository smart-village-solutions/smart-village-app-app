export type WasteAddress = {
  city?: string;
  id?: number | string | null;
  street?: string;
  zip?: string;
};

export const getAutoSelectableWasteAddress = (
  addresses: WasteAddress[] | undefined,
  selectedCity: string
) => {
  if (!selectedCity) return;

  const matchingAddresses = addresses?.filter(({ city }) => city === selectedCity);
  if (matchingAddresses?.length === 1 && matchingAddresses[0].id) return matchingAddresses[0];
};
