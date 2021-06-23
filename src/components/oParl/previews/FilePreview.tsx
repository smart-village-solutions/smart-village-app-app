import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';
import { FilePreviewData } from '../../../types';

import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: FilePreviewData;
  navigation: StackNavigationProp<any>;
};

export const FilePreview = ({ data, navigation }: Props) => {
  const { id, type, accessUrl, fileName, name } = data;

  const title = name || fileName || accessUrl;

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={title}
      navigation={navigation}
      screenTitle={texts.oparl.file.file}
    />
  );
};
