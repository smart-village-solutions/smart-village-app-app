import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';

import { getFullName } from '../../../helpers';
import { PersonPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: PersonPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const PersonPreview = ({ data, navigation }: Props) => {
  const { id, type } = data;

  const title = getFullName(texts.oparl.person.person, data);

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={title}
      topDivider={true}
      navigation={navigation}
      screenTitle={texts.oparl.person.person}
    />
  );
};
