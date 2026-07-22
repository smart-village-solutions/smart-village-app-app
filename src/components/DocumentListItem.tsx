import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Icon, normalize } from '../config';
import { ScreenName } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { DocumentTypes } from './DocumentList';
import { RegularText } from './Text';

export const DocumentListItem = ({ item }: { item: DocumentTypes }) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const navigation = useNavigation();

  const { contentType, id, sourceUrl, title } = item;
  const { url } = sourceUrl;

  return (
    <TouchableOpacity
      accessibilityLabel={title || `${id}.pdf`}
      style={styles.container}
      onPress={() =>
        navigation.navigate(ScreenName.Pdf, {
          pdfUrl: url,
          title: title || `${id}.pdf`
        })
      }
    >
      <RegularText>{title || `${id}.pdf`}</RegularText>
      <Icon.ArrowRight color={colors.primary} size={normalize(20)} />
    </TouchableOpacity>
  );
};

const createStyles = () => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalize(10)
  }
});
