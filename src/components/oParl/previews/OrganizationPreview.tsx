import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';

import { OrganizationPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = { navigation: NavigationScreenProp<never> } & OrganizationPreviewData;

export const OrganizationPreview = ({
  id,
  classification,
  deleted,
  name,
  navigation,
  shortName
}: Props) => {
  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText numberOfLines={1} primary lineThrough={deleted}>
        {name || shortName || classification || texts.oparl.organization.organization}
      </RegularText>
    </OParlItemPreview>
  );
};
