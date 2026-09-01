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

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * A concrete postal address needs a street and a locality that can identify the destination.
 * Descriptive additions, a city, or a postal code on their own are not a concrete address.
 */
export const hasConcretePostalAddress = (address) =>
  hasText(address?.street) && (hasText(address?.city) || hasText(address?.zip));

export const formatAddressSingleLine = (address) => {
  if (!address) return;

  const { city, street, zip, addition } = address;

  if (!city && !street && !zip && !addition) return;

  const streetPart = [addition, street].filter((s) => s?.length).join(' ');
  const cityPart = [zip, city].filter((s) => s?.length).join(' ');

  return [streetPart, cityPart].filter((s) => s?.length).join(', ');
};
