import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { getFullName } from '../../../helpers';
import { PersonPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlPreviewWrapper } from './OParlPreviewWrapper';

type Props = {
  data: PersonPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const PersonPreview = ({ data, navigation }: Props) => {
  const { deleted, id } = data;

  return (
    <OParlPreviewWrapper id={id} navigation={navigation}>
      <RegularText lineThrough={deleted} numberOfLines={1} primary>
        {getFullName(texts.oparl.person.person, data)}
      </RegularText>
    </OParlPreviewWrapper>
  );
};
