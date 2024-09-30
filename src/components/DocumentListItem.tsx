import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, Icon, normalize } from '../config';
import { ScreenName } from '../types';

import { DocumentTypes } from './DocumentList';
import { RegularText } from './Text';

export const DocumentListItem = ({ item }: { item: DocumentTypes }) => {
  const navigation = useNavigation();

  const { contentType, id, sourceUrl, title } = item;
  const { url } = sourceUrl;

  if (contentType !== 'application/pdf') {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate(ScreenName.Web, {
          webUrl: `https://docs.google.com/gview?embedded=true&url=${url}`,
          title: title || `${id}.pdf`,
          documentData: {
            title: title || `${id}`,
            url
          }
        })
      }
    >
      <RegularText>{title || `${id}.pdf`}</RegularText>
      <Icon.ArrowRight color={colors.primary} size={normalize(20)} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalize(10)
  }
});
