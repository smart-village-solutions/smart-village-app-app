export const formatAddress = (address) => {
  if (!address) return;

  const { city, street, zip, addition } = address;

  if (!city && !street && !zip && !addition) return;

  // the city and zip are supposed to be in one line together
  const cityPart = [zip, city].filter((s) => s?.length).join(' ');

  // add an extra ',' to the street, if it is defined
  return [addition, street?.length ? `${street},` : undefined, cityPart]
    .filter((s) => s?.length)
    .join(' ');
};

export const formatAddressSingleLine = (address) => {
  if (!address) return;

  const { city, street, zip, addition } = address;

  if (!city && !street && !zip && !addition) return;

  const streetPart = [addition, street].filter((s) => s?.length).join(' ');
  const cityPart = [zip, city].filter((s) => s?.length).join(' ');

  return [streetPart, cityPart].filter((s) => s?.length).join(', ');
};
