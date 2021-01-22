import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { texts } from '../../../config';

import { MembershipPreviewData, OrganizationPreviewData, PersonPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  navigation: NavigationScreenProp<never>;
  withPerson?: boolean;
} & MembershipPreviewData;

const getFullName = (person?: PersonPreviewData) => {
  if (!person) return texts.oparl.person.person;
  const { affix, familyName, formOfAddress, givenName, title } = person;
  const affixString = affix?.length ? `(${affix})` : undefined;
  return [formOfAddress, title, givenName, familyName, affixString]
    .filter((item) => !!item?.length)
    .join(' ');
};

const getOrganizationNameString = (organization?: OrganizationPreviewData) => {
  if (!organization) return texts.oparl.organization.organization;

  const { classification, name, shortName } = organization;

  return name || shortName || classification || texts.oparl.organization.organization;
};

// withPerson === true means that it is shown as part of an organization
// and we want to give information about the corresponding person in the preview
// withPerson === false means the opposite, so we want to show the information of the organization
export const MembershipPreview = ({
  id,
  navigation,
  onBehalfOf,
  organization,
  person,
  withPerson
}: Props) => {
  const nameString = person?.name ?? getFullName(person);
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
