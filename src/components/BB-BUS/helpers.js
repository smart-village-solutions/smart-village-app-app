import _filter from 'lodash/filter';

const getCommunicationsOfType = (type, communications) => {
  let result = _filter(communications, (communication) => communication.type.key === type)[0];

  return result;
};

export const getAddress = (addresses) => {
  if (!addresses?.length) return;

  let address = addresses[0];

  const { street, houseNumber, zipcode, city } = address;

  return {
    street: (!!street || !!houseNumber) && `${address.street} ${address.houseNumber}`,
    zip: zipcode,
    city: city
  };
};

export const getContact = (communications) => {
  if (!communications?.length) return;

  const phone = getCommunicationsOfType('TELEFON', communications);
  const fax = getCommunicationsOfType('FAX', communications);
  const email = getCommunicationsOfType('EMAIL', communications);
  const www = getCommunicationsOfType('WWW', communications);

  return {
    phone: phone?.value,
    fax: fax?.value,
    email: email?.value,
    www: www?.value
  };
};
