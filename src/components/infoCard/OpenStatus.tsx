import React from 'react';
import 'react-native';
import { Divider } from 'react-native-elements';

import { Icon, normalize } from '../../config';
import { isOpen } from '../../helpers';
import { OpeningHour } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  openingHours?: OpeningHour[];
};

export const OpenStatus = ({ openingHours }: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
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
        <WrapperRow centerVertical>
          <Icon.Clock color={colors.primary} style={styles.margin} />
          <RegularText>{status + additionalInfo}</RegularText>
        </WrapperRow>
      </WrapperVertical>

      <Divider style={styles.divider} />
    </>
  );
};

const createStyles = (colors) => ({
  divider: {
    backgroundColor: colors.placeholder
  },

  margin: {
    marginRight: normalize(12)
  }
});
