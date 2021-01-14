import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { MeetingPreviewData } from '../../../types';

import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = { navigation: NavigationScreenProp<never> } & MeetingPreviewData;

export const MeetingPreview = ({ id, cancelled, name, navigation, start }: Props) => {
  const dateString = start ? momentFormat(start.valueOf(), 'DD.MM.YYYY', 'x') : '';

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText lineThrough={cancelled} numberOfLines={1} primary>
        {name?.length ? name : texts.oparl.meeting}
      </RegularText>
      <RegularText>{dateString}</RegularText>
    </OParlItemPreview>
  );
};
