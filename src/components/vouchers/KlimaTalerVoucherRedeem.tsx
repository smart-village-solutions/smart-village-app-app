import React from 'react';

import { texts } from '../../config/texts';
import { useImportedVoucherOpening } from '../../klimaTaler/useImportedVoucherOpening';
import { Button } from '../Button';
import { RegularText } from '../Text';

export const KlimaTalerVoucherRedeem = ({ payload }: { payload: unknown }) => {
  const { available, opening, open } = useImportedVoucherOpening(payload);
  const copy = texts.klimaTaler.voucher;
  const actionTitle = available ? copy.use : copy.unavailable;

  return (
    <>
      {!available && <RegularText>{copy.unavailableMessage}</RegularText>}
      <Button
        title={opening ? texts.klimaTaler.opening : actionTitle}
        disabled={!available || opening}
        onPress={open}
      />
    </>
  );
};
