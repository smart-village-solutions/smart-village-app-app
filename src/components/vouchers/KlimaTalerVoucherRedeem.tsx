import React, { useContext, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { texts } from '../../config/texts';
import { readImportedKlimaTalerVoucher } from '../../klimaTaler/importedVoucher';
import { redeemImportedKlimaTalerVoucher } from '../../klimaTaler/redeemImportedVoucher';
import { isKlimaTalerConfigured } from '../../klimaTaler/settings';
import { Button } from '../Button';
import { RegularText } from '../Text';

export const KlimaTalerVoucherRedeem = ({ payload }: { payload: unknown }) => {
  const { globalSettings } = useContext(SettingsContext);
  const [opening, setOpening] = useState(false);
  const pending = useRef(false);
  const voucher = readImportedKlimaTalerVoucher(payload);
  const available = !!voucher && voucher.remaining > 0 && isKlimaTalerConfigured(globalSettings);
  const copy = texts.klimaTaler.voucher;

  const redeem = async () => {
    if (!available || pending.current) return;
    pending.current = true;
    setOpening(true);
    try {
      await redeemImportedKlimaTalerVoucher(payload);
    } catch {
      Alert.alert(texts.klimaTaler.title, copy.unavailableMessage);
    } finally {
      pending.current = false;
      setOpening(false);
    }
  };

  return (
    <>
      {!available && <RegularText>{copy.unavailableMessage}</RegularText>}
      <Button
        title={opening ? texts.klimaTaler.opening : available ? copy.use : copy.unavailable}
        disabled={!available || opening}
        onPress={redeem}
      />
    </>
  );
};
