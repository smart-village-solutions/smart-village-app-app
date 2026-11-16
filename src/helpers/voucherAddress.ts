import { Address } from '../types';

const hasAddress = (address?: Address | null) =>
  !!(
    address?.street ||
    address?.zip ||
    address?.city ||
    address?.addition ||
    (address?.geoLocation?.latitude != null && address?.geoLocation?.longitude != null)
  );

export const getVoucherPartnerAddress = (
  operatingCompanyAddress?: Address | null,
  poiAddresses?: Address[] | null
) => {
  if (hasAddress(operatingCompanyAddress)) return operatingCompanyAddress;

  return (
    poiAddresses?.find((address) => address.kind === 'default' && hasAddress(address)) ??
    poiAddresses?.find(hasAddress)
  );
};
