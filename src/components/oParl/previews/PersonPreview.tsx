import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import { normalize, texts } from '../../../config';
import { getFullName } from '../../../helpers';
import { PersonPreviewData } from '../../../types';
import { TextListItem } from '../../TextListItem';
import { getOrganizationNameString } from '../oParlHelpers';

type Props = {
  data: PersonPreviewData;
  navigation: StackNavigationProp<any>;
};

export const PersonPreview = ({ data, navigation }: Props) => {
  const { id, membership, type } = data;

  const title = getFullName(texts.oparl.person.person, data);
  const faction = membership?.find(
    (mem) => mem.organization?.classification === 'Fraktion' && !mem.endDate
  );

  const params = { id, type, title: texts.oparl.person.person };

  const item = {
    routeName: 'OParlDetail',
    params,
    subtitle: faction?.organization && getOrganizationNameString(faction.organization),
    title,
    topDivider: false
  };

  return <TextListItem containerStyle={styles.container} navigation={navigation} item={item} />;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: normalize(16)
  }
});
