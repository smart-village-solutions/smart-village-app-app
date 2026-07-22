import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import 'react-native';
import { ListItem } from 'react-native-elements';

import { consts, Icon, normalize } from '../../../config';
import { OParlObjectType } from '../../../types';
import { HtmlView } from '../../HtmlView';
import { Touchable } from '../../Touchable';
import { useThemeStyles } from '../../../hooks/useThemeStyles';
import { useTheme } from '../../../hooks/useTheme';

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
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  return (
    <ListItem
      bottomDivider={!topDivider}
      topDivider={topDivider}
      containerStyle={styles.container}
      onPress={() => navigation?.push('OParlDetail', { id, type, title: screenTitle ?? title })}
      disabled={!navigation}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${title}) ${consts.a11yLabel.button} `}
    >
      <ListItem.Content>
        <HtmlView html={title} />
      </ListItem.Content>

      {!!navigation && <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />}
    </ListItem>
  );
};

const createStyles = (colors) => ({
  container: {
    backgroundColor: colors.transparent,
    marginHorizontal: normalize(16),
    padding: 0,
    paddingVertical: normalize(12)
  }
});
