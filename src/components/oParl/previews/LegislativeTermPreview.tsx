import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { LegislativeTermPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: LegislativeTermPreviewData;
  navigation?: NavigationScreenProp<never>; // most other OParl types need navigation. this unifies their interfaces
};

const { legislativeTerm } = texts.oparl;

export const LegislativeTermPreview = ({ data }: Props) => {
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

  const title = (name ?? legislativeTerm.title) + suffix;
  return <OParlPreviewEntry id={id} type={type} title={title} />;
};
