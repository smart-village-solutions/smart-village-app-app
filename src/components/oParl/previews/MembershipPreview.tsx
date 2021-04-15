import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { getFullName, momentFormat } from '../../../helpers';
import { MembershipPreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { TextListItem } from '../../TextListItem';
import { Touchable } from '../../Touchable';
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
  const item = {
    routeName: 'OParlDetail',
    params: { id, type },
    subtitle: organizationName,
    title: titleWithPerson
  };

  const startString = startDate ? momentFormat(startDate.getTime(), 'DD.MM.YYYY', 'x') : '';
  const endString = endDate ? momentFormat(endDate.getTime(), 'DD.MM.YYYY', 'x') : '          ';
  const dateString = (startDate || endDate) && `${startString} - ${endString}`;

  return withPerson ? (
    <TextListItem navigation={navigation} item={item} />
  ) : (
    <Touchable style={styles.withoutPerson} onPress={() => navigation.push('OParlDetail', { id })}>
      <RegularText>{organizationName}</RegularText>
      <RegularText>{dateString}</RegularText>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  withoutPerson: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
