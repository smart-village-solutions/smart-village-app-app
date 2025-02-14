import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { normalize, texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { MeetingPreviewData } from '../../../types';
import { TextListItem } from '../../TextListItem';
import { StyleSheet } from 'react-native';

type Props = {
  data: MeetingPreviewData;
  navigation: StackNavigationProp<any>;
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

  return <TextListItem containerStyle={styles.container} navigation={navigation} item={item} />;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: normalize(16)
  }
});
