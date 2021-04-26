import React from 'react';
import { View } from 'react-native';

import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { Line } from '../LineEntry';

type Props = {
  endDate?: number;
  leftWidth?: number;
  startDate?: number;
  topDivider?: boolean;
};

const { dateSection } = texts.oparl;

export const DateSection = ({ endDate, leftWidth, startDate, topDivider = true }: Props) => {
  if (!endDate && !startDate) {
    return null;
  }

  const timeFormatString = 'HH:mm [Uhr]';

  const now = new Date().valueOf();
  const alreadyEnded = (endDate ?? 0) < now;
  const alreadyStarted = (startDate ?? 0) < now;

  const dateString = momentFormat((startDate ?? endDate)!, 'DD.MM.YYYY', 'x');

  return (
    <View>
      <Line
        left="Datum:"
        right={dateString}
        topDivider={topDivider ?? true}
        leftWidth={leftWidth}
      />
      {!!startDate && (
        <Line
          left={alreadyStarted ? dateSection.started : dateSection.starts}
          right={momentFormat(startDate, timeFormatString, 'x')}
          leftWidth={leftWidth}
        />
      )}
      {!!endDate && (
        <Line
          left={alreadyEnded ? dateSection.ended : dateSection.ends}
          right={momentFormat(endDate, timeFormatString, 'x')}
          leftWidth={leftWidth}
        />
      )}
    </View>
  );
};
