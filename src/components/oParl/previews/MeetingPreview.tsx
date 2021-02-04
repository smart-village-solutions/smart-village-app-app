import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { MeetingPreviewData } from '../../../types';

import { RegularText } from '../../Text';
import { OParlPreviewWrapper } from './OParlPreviewWrapper';

type Props = {
  data: MeetingPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const MeetingPreview = ({ data, navigation }: Props) => {
  const { id, cancelled, deleted, name, start } = data;

  const dateString = start ? momentFormat(start.valueOf(), 'DD.MM.YYYY', 'x') : '';

  return (
    <OParlPreviewWrapper id={id} navigation={navigation}>
      <RegularText lineThrough={cancelled || deleted} numberOfLines={1} primary>
        {name?.length ? name : texts.oparl.meeting.meeting}
      </RegularText>
      <RegularText>{dateString}</RegularText>
    </OParlPreviewWrapper>
  );
};
