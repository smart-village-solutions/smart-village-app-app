import changers from '../../modules/expo-changers';

import { isKlimaTalerEnabled, openKlimaTaler } from './entry';
import { readImportedKlimaTalerVoucher } from './importedVoucher';

export const redeemImportedKlimaTalerVoucher = async (payload: unknown) => {
  const voucher = readImportedKlimaTalerVoucher(payload);
  if (!voucher || voucher.remaining <= 0 || !isKlimaTalerEnabled())
    throw new Error('E_IMPORTED_VOUCHER_UNAVAILABLE');
  const status = await changers.getStatus();
  // Offer IDs may overlap across environments. Never open a stage offer in production.
  if (status.environment !== voucher.environment || !isKlimaTalerEnabled())
    throw new Error('E_IMPORTED_VOUCHER_UNAVAILABLE');
  await openKlimaTaler(voucher.offerId);
};
