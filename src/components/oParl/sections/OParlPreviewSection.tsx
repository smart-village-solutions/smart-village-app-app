import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import _isArray from 'lodash/isArray';

import { normalize } from '../../../config';
import { OParlObjectPreviewData } from '../../../types';
import { PreviewSection } from '../../PreviewSection';
import { OParlPreviewComponent } from '../previews/OParlPreviewComponent';
import { OParlItemPreview } from '../previews/OParlItemPreview';

type Props = {
  data?: OParlObjectPreviewData[] | OParlObjectPreviewData;
  header: string;
  navigation: NavigationScreenProp<never>;
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
    (itemData: OParlObjectPreviewData, key: number) => {
      return (
        <OParlPreviewComponent
          data={itemData}
          key={key}
          navigation={navigation}
          withAgendaItem={withAgendaItem}
          withPerson={withPerson}
        />
      );
    },
    [navigation, withAgendaItem, withPerson]
  );

  if (_isArray(data)) {
    return (
      <View style={styles.marginTop}>
        <PreviewSection data={data} header={header} renderItem={renderPreview} />
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
