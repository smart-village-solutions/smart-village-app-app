import _filter from 'lodash/filter';

const removeCommunicationsNesting = (key, communications) => {
  let result = _filter(communications, (communication) => {
    // fix for multi nested result form Directus API
    if (communication.communication) communication = communication.communication;

    return communication.type.key === key;
  })[0];
  // fix for multi nested result form Directus API
  if (result && result.communication) result = result.communication;

  return result;
};

export const getAddress = (addresses) => {
  if (!addresses?.length) return;

  let address = addresses[0];

  if (address.address) address = address.address;

  const { street, houseNumber, zipcode, city } = address;

  return {
    street: (!!street || !!houseNumber) && `${address.street} ${address.houseNumber}`,
    zip: zipcode,
    city: city
  };
};

export const getContact = (communications) => {
  if (!communications?.length) return;

  const phone = removeCommunicationsNesting('TELEFON', communications);
  const fax = removeCommunicationsNesting('FAX', communications);
  const email = removeCommunicationsNesting('EMAIL', communications);
  const www = removeCommunicationsNesting('WWW', communications);

  return {
    phone: phone?.value,
    fax: fax?.value,
    email: email?.value,
    www: www?.value
  };
};
