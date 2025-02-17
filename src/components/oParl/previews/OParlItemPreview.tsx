import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../../../config';
import { OParlObjectPreviewData } from '../../../types';
import { SectionHeader } from '../../SectionHeader';

import { OParlPreviewComponent } from './OParlPreviewComponent';

type Props = {
  data?: OParlObjectPreviewData;
  header?: string;
  navigation: StackNavigationProp<any>;
  withAgendaItem?: boolean;
  withPerson?: boolean;
};

export const OParlItemPreview = ({
  data,
  header,
  navigation,
  withAgendaItem,
  withPerson
}: Props) => {
  if (!data) {
    return null;
  }

  return (
    <View style={styles.marginTop}>
      {!!header?.length && <SectionHeader title={header} />}
      <OParlPreviewComponent
        data={data}
        navigation={navigation}
        withAgendaItem={withAgendaItem}
        withPerson={withPerson}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  marginTop: {
    marginTop: normalize(12)
  }
});
