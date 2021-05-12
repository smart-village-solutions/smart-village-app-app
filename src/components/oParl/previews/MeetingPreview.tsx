import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { MeetingPreviewData } from '../../../types';
import { TextListItem } from '../../TextListItem';

type Props = {
  data: MeetingPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const MeetingPreview = ({ data, navigation }: Props) => {
  const { id, type, name, start } = data;

  const subtitle = start ? momentFormat(start, 'DD.MM.YYYY | HH:mm', 'x') : undefined;

  const item = {
    routeName: 'OParlDetail',
    params: { id, type, title: texts.oparl.meeting.meeting },
    subtitle,
    title: name ?? texts.oparl.meeting.meeting
  };

  return <TextListItem navigation={navigation} item={item} />;
};
