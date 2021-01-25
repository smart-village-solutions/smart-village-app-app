import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { LegislativeTermPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: LegislativeTermPreviewData;
  navigation: NavigationScreenProp<never>;
};

const { legislativeTerm } = texts.oparl;

export const LegislativeTermPreview = ({ data, navigation }: Props) => {
  const { id, endDate, name, startDate } = data;

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

  const previewString = `${name ?? legislativeTerm.title}${suffix}`;

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText primary>{previewString}</RegularText>
    </OParlItemPreview>
  );
};
