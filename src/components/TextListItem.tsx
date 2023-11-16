import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { memo, NamedExoticComponent, Validator } from 'react';
import { ImageStyle, StyleSheet, ViewStyle } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../config';
import { isOpen, trimNewLines } from '../helpers';

import { Image } from './Image';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

export type ItemData = {
  id: string;
  badge?: { value: string; textStyle: { color: string } };
  bottomDivider?: boolean;
  leftIcon?: React.ReactElement;
  overtitle?: string;
  onPress?: (navigation: any) => void;
  params: Record<string, unknown>;
  picture?: { url: string };
  rightIcon?: React.ReactElement;
  routeName: string;
  statustitle?: string;
  statustitleIcon?: React.ReactElement;
  subtitle?: string;
  teaserTitle?: string;
  title: string;
  topDivider?: boolean;
};

type Props = {
  containerStyle?: ViewStyle;
  imageContainerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  item: ItemData;
  leftImage?: boolean;
  listsWithoutArrows?: boolean | undefined;
  navigation: StackNavigationProp<Record<string, any>>;
  noOvertitle?: boolean;
  noSubtitle?: boolean;
  rightImage?: boolean;
  showOpenStatus?: boolean;
  withCard?: boolean;
};

/* eslint-disable complexity */
export const TextListItem: NamedExoticComponent<Props> & {
  propTypes?: Record<string, Validator<any>>;
} & {
  defaultProps?: Partial<Props>;
} = memo<Props>(
  ({
    containerStyle,
    imageContainerStyle,
    imageStyle,
    item,
    leftImage,
    listsWithoutArrows,
    navigation,
    noSubtitle,
    noOvertitle,
    rightImage,
    showOpenStatus,
    withCard
  }) => {
    const {
      badge,
      bottomDivider,
      leftIcon,
      onPress,
      overtitle,
      params,
      picture,
      rightIcon,
      routeName: name,
      statustitle,
      statustitleIcon,
      subtitle,
      teaserTitle,
      title,
      topDivider
    } = item;
    const navigate = () => navigation && navigation.push(name, params);
    let titleText = withCard ? (
      <BoldText small style={{ marginTop: normalize(2) }}>
        {trimNewLines(title)}
      </BoldText>
    ) : (
      <BoldText small>{trimNewLines(title)}</BoldText>
    );

    let status = '';
    if (showOpenStatus) {
      status = isOpen(params?.details?.openingHours)?.open ? 'Jetzt geöffnet' : 'Geschlossen';
    }

    if (teaserTitle) {
      titleText = (
        <>
          {titleText}
          <RegularText small>{teaserTitle}</RegularText>
        </>
      );
    }

    if (statustitle) {
      titleText = (
        <>
          {titleText}
          <WrapperRow style={styles.statustitleWrapper}>
            {!!statustitleIcon && statustitleIcon}
            <RegularText small placeholder>
              {statustitle}
            </RegularText>
          </WrapperRow>
        </>
      );
    }

    // `title` is the first line and `subtitle` the second line, so `title` is used with our subtitle
    // content and `subtitle` is used with the main title
    return (
      <ListItem
        bottomDivider={bottomDivider !== undefined ? bottomDivider : true}
        topDivider={topDivider !== undefined ? topDivider : false}
        containerStyle={[
          styles.container,
          containerStyle,
          (bottomDivider || topDivider) && styles.containerBorder
        ]}
        badge={badge}
        onPress={() => (onPress ? onPress(navigation) : navigate())}
        disabled={!navigation}
        delayPressIn={0}
        Component={Touchable}
        accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
      >
        {leftIcon ||
          (leftImage && !!picture?.url ? (
            <Image
              source={{ uri: picture.url }}
              childrenContainerStyle={[
                styles.smallImage,
                imageStyle,
                withCard && styles.withBigCardStyle
              ]}
              borderRadius={withCard ? normalize(8) : undefined}
              containerStyle={[styles.smallImageContainer, imageContainerStyle]}
            />
          ) : undefined)}

        {withCard ? (
          <ListItem.Content>
            {!!overtitle && <RegularText smallest>{trimNewLines(overtitle)}</RegularText>}
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? titleText : <RegularText smallest>{subtitle}</RegularText>}
          </ListItem.Content>
        ) : (
          <ListItem.Content>
            {!noOvertitle && !!overtitle && (
              <RegularText smallest>{trimNewLines(overtitle)}</RegularText>
            )}
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? titleText : <RegularText smallest>{subtitle}</RegularText>}
            {!!status && <RegularText>{status}</RegularText>}
          </ListItem.Content>
        )}

        {rightIcon ||
          (rightImage && !!picture?.url ? (
            <Image
              source={{ uri: picture.url }}
              childrenContainerStyle={[styles.smallImage, withCard && styles.withBigCardStyle]}
              borderRadius={withCard ? normalize(8) : undefined}
              containerStyle={styles.smallImageContainer}
            />
          ) : undefined)}

        {!listsWithoutArrows && !!navigation && !withCard && (
          <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />
        )}
      </ListItem>
    );
  }
);
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(12)
  },
  containerBorder: {
    borderBottomColor: colors.borderRgba,
    borderBottomWidth: 1
  },
  smallImage: {
    height: normalize(72),
    width: normalize(96)
  },
  smallImageContainer: {
    alignSelf: 'flex-start'
  },
  statustitleWrapper: {
    marginTop: normalize(7)
  },
  withBigCardStyle: {
    height: normalize(72),
    width: normalize(96)
  }
});

TextListItem.displayName = 'TextListItem';

TextListItem.propTypes = {
  containerStyle: PropTypes.object,
  imageContainerStyle: PropTypes.object,
  imageStyle: PropTypes.object,
  item: PropTypes.object.isRequired,
  leftImage: PropTypes.bool,
  listsWithoutArrows: PropTypes.bool,
  navigation: PropTypes.object,
  noOvertitle: PropTypes.bool,
  noSubtitle: PropTypes.bool,
  rightImage: PropTypes.bool,
  showOpenStatus: PropTypes.bool,
  withCard: PropTypes.bool
};

TextListItem.defaultProps = {
  leftImage: false,
  listsWithoutArrows: false,
  noOvertitle: false,
  noSubtitle: false,
  rightImage: false,
  withCard: false
};
