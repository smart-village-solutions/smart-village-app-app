import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { BodyPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: BodyPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const BodyPreview = ({ data, navigation }: Props) => {
  const { deleted, id, name, shortName } = data;

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText lineThrough={deleted} numberOfLines={1} primary>
        {shortName ? `${shortName} (${name})` : name}
      </RegularText>
    </OParlItemPreview>
  );
};
