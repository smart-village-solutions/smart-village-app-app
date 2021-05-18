import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';
import { PaperPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: PaperPreviewData;
  navigation: StackNavigationProp<any>;
};

export const PaperPreview = ({ data, navigation }: Props) => {
  const { id, type, name, reference } = data;

  const title = name || reference || texts.oparl.paper.paper;

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={title}
      navigation={navigation}
      screenTitle={texts.oparl.paper.paper}
    />
  );
};
