type WasteAddress = {
  city?: string | null;
  id?: number | string | null;
  street?: string | null;
  zip?: string | null;
};

export const getAutoSelectableWasteAddress = (
  addresses: WasteAddress[] | undefined,
  selectedCity: string
) => {
  if (!selectedCity) return;

  const matchingAddresses = addresses?.filter(({ city }) => city === selectedCity);
  if (matchingAddresses?.length === 1 && matchingAddresses[0].id) return matchingAddresses[0];
};
