import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';

import { getFullName } from '../../../helpers';
import { PersonPreviewData } from '../../../types';
import { TextListItem } from '../../TextListItem';
import { getOrganizationNameString } from '../oParlHelpers';

type Props = {
  data: PersonPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const PersonPreview = ({ data, navigation }: Props) => {
  const { id, membership, type } = data;

  const title = getFullName(texts.oparl.person.person, data);
  const faction = membership?.find(
    (membership) => membership.organization?.classification === 'Fraktion' && !membership.endDate
  )?.organization;

  const params = { id, type, title: texts.oparl.person.person };

  const item = {
    routeName: 'OParlDetail',
    params,
    subtitle: faction && getOrganizationNameString(faction),
    title,
    topDivider: true,
    bottomDivider: false
  };

  return <TextListItem navigation={navigation} item={item} />;
};
