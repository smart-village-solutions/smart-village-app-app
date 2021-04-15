import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { NavigationScreenProp } from 'react-navigation';
import { colors, normalize } from '../../../config';
import { arrowRight } from '../../../icons';

import { OParlObjectType } from '../../../types';
import { Icon } from '../../Icon';
import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';

type Props = {
  id: string;
  type: OParlObjectType;
  title: string;
  navigation?: NavigationScreenProp<never>;
};

export const OParlPreviewEntry = ({ id, type, title, navigation }: Props) => {
  return (
    <ListItem
      title={<RegularText>{title}</RegularText>}
      bottomDivider
      containerStyle={styles.container}
      rightIcon={navigation && <Icon xml={arrowRight(colors.primary)} />}
      onPress={() => navigation?.push('OParlDetail', { id, type })}
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
