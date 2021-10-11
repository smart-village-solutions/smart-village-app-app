export const formatAddress = (address) => {
  if (!address) return;

  const { city, street, zip, addition } = address;
  let readableAddress = '';

  if (!city && !street && !zip && !addition) return;

  // build the address in multiple steps to check every data before rendering
  if (addition?.length) {
    readableAddress += `${addition}${'\n'}`;
  }
  if (street?.length) {
    readableAddress += `${street},${'\n'}`;
  }
  if (zip?.length) {
    readableAddress += `${zip} `;
  }
  if (city?.length) {
    readableAddress += city;
  }

  return readableAddress;
};

export const formatAddressSingleLine = (address) => {
  if (!address) return;

  const { city, street, zip, addition } = address;
  let readableAddress = '';

  if (!city && !street && !zip && !addition) return;

  // build the address in multiple steps to check every data before rendering
  if (addition?.length) {
    readableAddress += `${addition} `;
  }
  if (street?.length) {
    readableAddress += `${street}, `;
  }
  if (zip?.length) {
    readableAddress += `${zip} `;
  }
  if (city?.length) {
    readableAddress += city;
  }

  return readableAddress;
};
