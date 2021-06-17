import PropTypes from 'prop-types';
import React, { memo, NamedExoticComponent, Validator } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { arrowRight } from '../icons';
import { Icon } from './Icon';
import { Image } from './Image';

import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';
import { trimNewLines } from '../helpers';
import { NavigationScreenProp } from 'react-navigation';

type ItemData = {
  routeName: string;
  params: Record<string, unknown>;
  subtitle?: string;
  title: string;
  bottomDivider?: boolean;
  topDivider?: boolean;
  picture?: { url: string };
};

type Props = {
  item: ItemData;
  leftImage?: boolean | undefined;
  navigation: NavigationScreenProp<never>;
  noSubtitle?: boolean | undefined;
};

export const TextListItem: NamedExoticComponent<Props> & {
  propTypes?: Record<string, Validator<any>>;
} & {
  defaultProps?: Partial<Props>;
} = memo<{
  item: ItemData;
  leftImage?: boolean;
  navigation: NavigationScreenProp<never>;
  noSubtitle?: boolean;
}>(({ navigation, item, noSubtitle, leftImage }) => {
  const { routeName, params, subtitle, title, bottomDivider, topDivider, picture } = item;

  const titleText = <BoldText>{trimNewLines(title)}</BoldText>;

  return (
    <ListItem
      title={noSubtitle || !subtitle ? titleText : <RegularText small>{subtitle}</RegularText>}
      subtitle={noSubtitle || !subtitle ? undefined : titleText}
      bottomDivider={bottomDivider !== undefined ? bottomDivider : true}
      topDivider={topDivider !== undefined ? topDivider : false}
      containerStyle={styles.container}
      rightIcon={<Icon xml={arrowRight(colors.primary)} />}
      leftIcon={
        leftImage && !!picture?.url ? (
          <Image
            source={{ uri: picture.url }}
            style={styles.smallImage}
            containerStyle={styles.smallImageContainer}
          />
        ) : undefined
      }
      onPress={() => navigation && navigation.push(routeName, params)}
      disabled={!navigation}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={(`${title}`, consts.a11yLabel.button)}
    />
  );
});
//Fix:accessibilityLabel
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(12)
  },
  smallImage: {
    height: normalize(33),
    width: normalize(66)
  },
  smallImageContainer: {
    alignSelf: 'flex-start'
  }
});

TextListItem.displayName = 'TextListItem';

TextListItem.propTypes = {
  navigation: PropTypes.object,
  item: PropTypes.object.isRequired,
  noSubtitle: PropTypes.bool,
  leftImage: PropTypes.bool
};

TextListItem.defaultProps = {
  noSubtitle: false,
  leftImage: false
};
