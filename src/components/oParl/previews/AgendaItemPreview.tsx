import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { AgendaItemPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: AgendaItemPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const AgendaItemPreview = ({ data, navigation }: Props) => {
  const { id, type, name, number } = data;

  const title = (number ?? '•') + ' ' + (name ?? '');

  return <OParlPreviewEntry id={id} type={type} title={title} navigation={navigation} />;
};
