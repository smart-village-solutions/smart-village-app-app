import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';
import { SystemPreviewData } from '../../../types';

import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: SystemPreviewData;
  navigation: StackNavigationProp<any>;
};

export const SystemPreview = ({ data, navigation }: Props) => {
  const { id, type, name, oparlVersion } = data;

  const nameString = name || texts.oparl.system.system;

  const suffix = oparlVersion ? ` (${oparlVersion})` : '';

  const title = nameString + suffix;

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={title}
      navigation={navigation}
      screenTitle={texts.oparl.system.system}
    />
  );
};
