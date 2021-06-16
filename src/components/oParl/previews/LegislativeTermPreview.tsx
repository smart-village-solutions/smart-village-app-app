import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { LegislativeTermPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: LegislativeTermPreviewData;
  navigation?: StackNavigationProp<any>;
};

const { legislativeTerm } = texts.oparl;

export const LegislativeTermPreview = ({ data, navigation }: Props) => {
  const { id, type, endDate, name, startDate } = data;

  let suffix = '';

  if (startDate) {
    const startSuffix = startDate && momentFormat(startDate.valueOf(), 'MM.YYYY', 'x');

    if (endDate) {
      const endSuffix = endDate && momentFormat(endDate.valueOf(), 'MM.YYYY', 'x');

      suffix = ` (${startSuffix} - ${endSuffix})`;
    } else {
      suffix = ` (${startSuffix})`;
    }
  }

  const title = (name ?? legislativeTerm.legislativeTerm) + suffix;
  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={title}
      navigation={navigation}
      screenTitle={texts.oparl.legislativeTerm.legislativeTerm}
    />
  );
};
