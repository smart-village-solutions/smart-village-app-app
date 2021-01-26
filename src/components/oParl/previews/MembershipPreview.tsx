import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { getFullName } from '../../../helpers';
import { MembershipPreviewData, OrganizationPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: MembershipPreviewData;
  navigation: NavigationScreenProp<never>;
  withPerson?: boolean;
};

const getOrganizationNameString = (organization?: OrganizationPreviewData) => {
  if (!organization) return texts.oparl.organization.organization;

  const { classification, name, shortName } = organization;

  return name || shortName || classification || texts.oparl.organization.organization;
};

// withPerson === true means that it is shown as part of an organization
// and we want to give information about the corresponding person in the preview
// withPerson === false means the opposite, so we want to show the information of the organization
export const MembershipPreview = ({ data, navigation, withPerson }: Props) => {
  const { id, onBehalfOf, organization, person } = data;

  const nameString = getFullName(texts.oparl.person.person, person);
  const textWithPerson = onBehalfOf
    ? `${nameString} (${getOrganizationNameString(onBehalfOf)})`
    : nameString;

  const textWithoutPerson = getOrganizationNameString(organization);

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText numberOfLines={1} primary>
        {withPerson ? textWithPerson : textWithoutPerson}
      </RegularText>
    </OParlItemPreview>
  );
};
