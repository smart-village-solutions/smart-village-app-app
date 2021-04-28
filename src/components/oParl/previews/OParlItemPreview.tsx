import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { normalize } from '../../../config';
import { OParlObjectPreviewData } from '../../../types';
import { SectionHeader } from '../../SectionHeader';
import { AdditionalPreviewProps } from './additionalPreviewProps';
import { OParlPreviewComponent } from './OParlPreviewComponent';

type Props = {
  additionalProps?: AdditionalPreviewProps;
  data?: OParlObjectPreviewData;
  header: string;
  navigation: NavigationScreenProp<never>;
};

export const OParlItemPreview = ({ data, header, navigation, additionalProps }: Props) => {
  if (!data) {
    return null;
  }

  return (
    <View style={styles.marginTop}>
      <SectionHeader title={header} />
      <OParlPreviewComponent
        data={data}
        navigation={navigation}
        additionalProps={additionalProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  marginTop: {
    marginTop: normalize(12)
  }
});
