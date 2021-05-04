import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';

import { BodyPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: BodyPreviewData;
  navigation: NavigationScreenProp<never>;
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
