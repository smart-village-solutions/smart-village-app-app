import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { NavigationScreenProp } from 'react-navigation';
import { colors, consts, normalize } from '../../../config';
import { arrowRight } from '../../../icons';

import { OParlObjectType } from '../../../types';
import { HtmlView } from '../../HtmlView';
import { Icon } from '../../Icon';
import { Touchable } from '../../Touchable';

type Props = {
  id: string;
  type: OParlObjectType;
  title: string;
  navigation?: NavigationScreenProp<never>;
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
      rightIcon={navigation && <Icon xml={arrowRight(colors.primary)} />}
      onPress={() => navigation?.push('OParlDetail', { id, type, title: screenTitle ?? title })}
      disabled={!navigation}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={(`${title}`, consts.a11yLabel.button)}
    />
  );
};
//Fix:accessibilityLabel

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(12)
  }
});
