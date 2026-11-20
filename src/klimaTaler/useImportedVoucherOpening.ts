import { useContext, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { texts } from '../config/texts';

import { readImportedKlimaTalerVoucher } from './importedVoucher';
import { redeemImportedKlimaTalerVoucher } from './redeemImportedVoucher';
import { isKlimaTalerConfigured } from './settings';

// Both POI cards and voucher detail buttons use the same guarded provider entry.
export const useImportedVoucherOpening = (payload: unknown) => {
  const { globalSettings } = useContext(SettingsContext);
  const [opening, setOpening] = useState(false);
  const pending = useRef(false);
  const voucher = readImportedKlimaTalerVoucher(payload);
  const available = !!voucher && voucher.remaining > 0 && isKlimaTalerConfigured(globalSettings);

  const open = async () => {
    if (!available || pending.current) return;
    pending.current = true;
    setOpening(true);
    try {
      await redeemImportedKlimaTalerVoucher(payload);
    } catch {
      Alert.alert(texts.klimaTaler.title, texts.klimaTaler.voucher.unavailableMessage);
    } finally {
      pending.current = false;
      setOpening(false);
    }
  };

  return { available, opening, open };
};
