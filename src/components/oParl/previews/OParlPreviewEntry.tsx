import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, Icon, normalize } from '../../../config';
import { OParlObjectType } from '../../../types';
import { HtmlView } from '../../HtmlView';
import { Touchable } from '../../Touchable';

type Props = {
  id: string;
  type: OParlObjectType;
  title: string;
  navigation?: StackNavigationProp<any>;
  screenTitle?: string;
  topDivider?: boolean;
};

export const OParlPreviewEntry = ({
  id,
  type,
  title,
  navigation,
  screenTitle,
  topDivider = false
}: Props) => {
  return (
    <ListItem
      title={<HtmlView html={title} />}
      bottomDivider={!topDivider}
      topDivider={topDivider}
      containerStyle={styles.container}
      rightIcon={navigation && <Icon.ArrowRight />}
      onPress={() => navigation?.push('OParlDetail', { id, type, title: screenTitle ?? title })}
      disabled={!navigation}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`${title} (Taste)`}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(12)
  }
});
