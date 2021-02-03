import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { normalize } from '../../../config';
import { OParlObjectPreviewData } from '../../../types';
import { BoldText } from '../../Text';
import { OParlPreviewComponent } from './OParlPreviewComponent';

type Props = {
  additionalProps?: {
    withAgendaItem?: boolean;
    withNumberAndTime?: boolean;
    withPerson?: boolean;
  };
  data?: OParlObjectPreviewData;
  header: JSX.Element | string;
  navigation: NavigationScreenProp<never>;
};

export const OParlItemPreview = ({ data, header, navigation, additionalProps }: Props) => {
  if (!data) {
    return null;
  }

  return (
    <View style={styles.marginTop}>
      <BoldText>{header}</BoldText>
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
