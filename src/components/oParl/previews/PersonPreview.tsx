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

const cutOffAfter = (arr: string[] | undefined, after: number) => {
  if (!arr) return;

  if (arr.length > after) {
    const res = arr.slice(0, after);
    res.push('...');
    return res;
  }

  return arr;
};

export const PersonPreview = ({ data, navigation }: Props) => {
  const { id, membership, type } = data;

  const nameString = getFullName(texts.oparl.person.person, data);
  const membershipString = cutOffAfter(
    membership
      ?.filter((mem) => !!mem.organization?.name || !!mem.organization?.shortName)
      .map((item) => getOrganizationNameString(item.organization)),
    3
  )?.join(', ');

  const item = {
    routeName: 'OParlDetail',
    params: { id, type },
    subtitle: membershipString,
    title: nameString
  };

  return <TextListItem navigation={navigation} item={item} />;
};
