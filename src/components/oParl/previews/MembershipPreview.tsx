import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../../../config';
import { getFullName, momentFormat } from '../../../helpers';
import { MembershipPreviewData } from '../../../types';
import { WrapperHorizontal } from '../../Wrapper';
import { getOrganizationNameString } from '../oParlHelpers';
import { Row } from '../Row';

type Props = {
  data: MembershipPreviewData;
  navigation: StackNavigationProp<any>;
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
  const params = { id, type, title: texts.oparl.membership.membership };

  return (
    <WrapperHorizontal>
      <Row
        left={withPerson ? titleWithPerson : organizationName}
        right={dateString}
        leftWidth={130}
        fullText
        smallLeft={false}
        onPress={() => navigation.push('OParlDetail', params)}
      />
    </WrapperHorizontal>
  );
};
