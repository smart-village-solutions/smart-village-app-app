import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';

import { BodyPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: BodyPreviewData;
  navigation: StackNavigationProp<any>;
};

export const BodyPreview = ({ data, navigation }: Props) => {
  const { id, type, name, shortName } = data;

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={shortName ? `${shortName} (${name})` : name}
      navigation={navigation}
      screenTitle={texts.oparl.body.body}
    />
  );
};
