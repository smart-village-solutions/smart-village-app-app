import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { getFullName } from '../../../helpers';
import { PersonPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: PersonPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const PersonPreview = ({ data, navigation }: Props) => {
  const { deleted, id } = data;

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText lineThrough={deleted} numberOfLines={1} primary>
        {getFullName(texts.oparl.person.person, data)}
      </RegularText>
    </OParlItemPreview>
  );
};
