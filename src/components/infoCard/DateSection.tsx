import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { Icon, colors, normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { SVA_Date } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  dates?: SVA_Date[];
};

export const DateSection = ({ dates }: Props) => {
  if (!dates?.length) {
    return null;
  }

  const dateStart = dates[0].dateStart;
  const dateEnd = dates[0].dateEnd;

  if (!dateStart || !dateEnd) {
    return null;
  }

  return (
    <>
      <WrapperVertical>
        <WrapperRow centerVertical>
          <Icon.Calendar style={styles.margin} />
          <RegularText>
            {momentFormat(dateStart)} - {momentFormat(dateEnd)}
          </RegularText>
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
