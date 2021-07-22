import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';
import { AgendaItemPreviewData } from '../../../types';

import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: AgendaItemPreviewData;
  navigation: StackNavigationProp<any>;
};

export const AgendaItemPreview = ({ data, navigation }: Props) => {
  const { id, type, name, number } = data;

  const title = (number ?? '•') + ' ' + (name ?? '');

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={title}
      navigation={navigation}
      screenTitle={texts.oparl.agendaItem.agendaItem}
    />
  );
};
