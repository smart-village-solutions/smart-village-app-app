import { StackNavigationProp } from '@react-navigation/stack';
import _isArray from 'lodash/isArray';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { normalize } from '../../../config';
import { OParlObjectPreviewData } from '../../../types';
import { SectionHeader } from '../../SectionHeader';
import { OParlItemPreview } from '../previews/OParlItemPreview';
import { OParlPreviewComponent } from '../previews/OParlPreviewComponent';

type Props = {
  data?: OParlObjectPreviewData[] | OParlObjectPreviewData;
  header?: string;
  navigation: StackNavigationProp<any>;
  withAgendaItem?: boolean;
  withPerson?: boolean;
};

export const OParlPreviewSection = ({
  data,
  header,
  navigation,
  withAgendaItem,
  withPerson
}: Props) => {
  const renderPreview = useCallback(
    (itemData: OParlObjectPreviewData) => {
      return (
        <OParlPreviewComponent
          data={itemData}
          key={itemData.id}
          navigation={navigation}
          withAgendaItem={withAgendaItem}
          withPerson={withPerson}
        />
      );
    },
    [navigation, withAgendaItem, withPerson]
  );

  if (_isArray(data)) {
    if (!data.length) return null;

    return (
      <View style={styles.marginTop}>
        {header?.length ? <SectionHeader title={header} /> : <Divider />}
        {data.map((item) => renderPreview(item))}
      </View>
    );
  } else {
    return (
      <OParlItemPreview
        data={data}
        header={header}
        navigation={navigation}
        withAgendaItem={withAgendaItem}
        withPerson={withPerson}
      />
    );
  }
};

const styles = StyleSheet.create({
  marginTop: {
    marginTop: normalize(14)
  }
});
