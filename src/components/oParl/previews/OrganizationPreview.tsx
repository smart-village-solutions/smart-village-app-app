import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { OrganizationPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlPreviewWrapper } from './OParlPreviewWrapper';

type Props = {
  data: OrganizationPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const OrganizationPreview = ({ data, navigation }: Props) => {
  const { id, classification, deleted, name, shortName } = data;

  return (
    <OParlPreviewWrapper id={id} navigation={navigation}>
      <RegularText numberOfLines={1} primary lineThrough={deleted}>
        {name || shortName || classification || texts.oparl.organization.organization}
      </RegularText>
    </OParlPreviewWrapper>
  );
};
