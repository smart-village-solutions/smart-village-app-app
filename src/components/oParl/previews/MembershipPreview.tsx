import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { getFullName, momentFormat } from '../../../helpers';
import { MembershipPreviewData } from '../../../types';
import { Line } from '../LineEntry';
import { getOrganizationNameString } from '../oParlHelpers';

type Props = {
  data: MembershipPreviewData;
  navigation: NavigationScreenProp<never>;
  withPerson?: boolean;
};

// withPerson === true means that it is shown as part of an organization
// and we want to give information about the corresponding person in the preview
// withPerson === false means the opposite, so we want to show the information of the organization
export const MembershipPreview = ({ data, navigation, withPerson }: Props) => {
  const { id, type, onBehalfOf, organization, person, startDate, endDate } = data;

  const nameString = getFullName(texts.oparl.person.person, person);

  const titleWithPerson = onBehalfOf
    ? `${nameString} (${getOrganizationNameString(onBehalfOf)})`
    : nameString;

  const organizationName = getOrganizationNameString(organization);

  const startString = startDate ? momentFormat(startDate, 'DD.MM.YYYY', 'x') : '';
  const endString = endDate ? momentFormat(endDate, 'DD.MM.YYYY', 'x') : '          ';
  const dateString = startDate || endDate ? `${startString} - ${endString}` : undefined;

  return withPerson ? (
    <Line
      left={titleWithPerson}
      right={dateString}
      leftWidth={120}
      fullText
      onPress={() => navigation.push('OParlDetail', { id, type })}
    />
  ) : (
    <Line
      left={organizationName}
      right={dateString}
      leftWidth={120}
      fullText
      onPress={() => navigation.push('OParlDetail', { id, type })}
    />
  );
};
