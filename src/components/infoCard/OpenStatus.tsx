import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { RegularText } from '../Text';
import { InfoBox, WrapperRow, WrapperVertical } from '../Wrapper';
import { colors, Icon, normalize } from '../../config';
import { isOpen } from '../../helpers';
import { OpeningHour } from '../../types';

type Props = {
  openingHours?: OpeningHour[];
};

export const OpenStatus = ({ openingHours }: Props) => {
  if (!openingHours?.length) {
    return null;
  }

  const openStatus = isOpen(openingHours);

  if (!openStatus) {
    return null;
  }

  const status = openStatus.open ? 'Jetzt geöffnet' : 'Geschlossen';

  let additionalInfo = '';

  if (openStatus.timeDiff && openStatus.timeDiff < 60) {
    if (openStatus.open) {
      additionalInfo = ` (schließt in ${openStatus.timeDiff} min)`;
    } else {
      additionalInfo = ` (öffnet in ${openStatus.timeDiff} min)`;
    }
  }

  return (
    <>
      <WrapperVertical>
        <WrapperRow>
          <Icon.Clock color={colors.primary} style={styles.margin} />
          <RegularText>{status + additionalInfo}</RegularText>
        </WrapperRow>
      </WrapperVertical>
      <Divider style={styles.divider} />
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  },
  margin: {
    marginRight: normalize(12)
  }
});
