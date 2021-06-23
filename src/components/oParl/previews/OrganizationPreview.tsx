import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';
import { OrganizationPreviewData } from '../../../types';
import { getOrganizationNameString } from '../oParlHelpers';

import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: OrganizationPreviewData;
  navigation: StackNavigationProp<any>;
};

export const OrganizationPreview = ({ data, navigation }: Props) => {
  const { id, type } = data;

  const title = getOrganizationNameString(data);

  return (
    <OParlPreviewEntry
      id={id}
      type={type}
      title={title}
      navigation={navigation}
      screenTitle={texts.oparl.organization.organization}
    />
  );
};
