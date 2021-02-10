export const formatAddress = (address) => {
  if (!address) return;

  const { city, street, zip, addition } = address;
  let readableAddress = '';

  if (!city && !street && !zip && !addition) return null;

  // build the address in multiple steps to check every data before rendering
  if (addition) {
    readableAddress += `${addition}${'\n'}`;
  }
  if (street) {
    readableAddress += `${street},${'\n'}`;
  }
  if (zip) {
    readableAddress += `${zip} `;
  }
  if (city) {
    readableAddress += city;
  }

  return readableAddress;
};
