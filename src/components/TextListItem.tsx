import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { memo, NamedExoticComponent, Validator } from 'react';
import { ImageStyle, StyleSheet, ViewStyle } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../config';
import { isOpen, trimNewLines } from '../helpers';

import { Image } from './Image';
import { HeadlineText, RegularText } from './Text';
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
  listItemStyle?: ViewStyle;
  listsWithoutArrows?: boolean | undefined;
  navigation: StackNavigationProp<Record<string, any>>;
  noSubtitle?: boolean;
  noOvertitle?: boolean;
  rightImage?: boolean;
  showOpenStatus?: boolean;
  titleFirst?: boolean;
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
    listItemStyle,
    listsWithoutArrows,
    navigation,
    noSubtitle,
    noOvertitle,
    rightImage,
    showOpenStatus,
    titleFirst,
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
      <HeadlineText small style={{ marginTop: normalize(2) }}>
        {trimNewLines(title)}
      </HeadlineText>
    ) : (
      <HeadlineText small>{trimNewLines(title)}</HeadlineText>
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
              style={[
                styles.smallImage,
                imageStyle && imageStyle,
                withCard && styles.withBigCardStyle
              ]}
              borderRadius={withCard ? normalize(8) : undefined}
              containerStyle={[styles.smallImageContainer, imageContainerStyle]}
            />
          ) : undefined)}

        {withCard ? (
          <ListItem.Content>
            {!!overtitle && (
              <HeadlineText smallest uppercase>
                {trimNewLines(overtitle)}
              </HeadlineText>
            )}
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? (
              titleText
            ) : (
              <RegularText small style={styles.subtitle}>
                {subtitle}
              </RegularText>
            )}
          </ListItem.Content>
        ) : (
          <ListItem.Content style={listItemStyle}>
            {!noOvertitle && !!overtitle && (
              <HeadlineText smallest uppercase>
                {trimNewLines(overtitle)}
              </HeadlineText>
            )}
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? (
              titleText
            ) : (
              <RegularText small style={styles.subtitle}>
                {subtitle}
              </RegularText>
            )}
            {!!status && <RegularText>{status}</RegularText>}
          </ListItem.Content>
        )}

        {rightIcon ||
          (rightImage && !!picture?.url ? (
            <Image
              source={{ uri: picture.url }}
              style={[styles.smallImage, withCard && styles.withBigCardStyle]}
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
    paddingHorizontal: 0,
    paddingVertical: normalize(12)
  },
  containerBorder: {
    borderBottomColor: colors.borderRgba,
    borderBottomWidth: 1
  },
  smallImage: {
    height: normalize(33),
    width: normalize(66)
  },
  smallImageContainer: {
    alignSelf: 'flex-start'
  },
  statustitleWrapper: {
    marginTop: normalize(7)
  },
  subtitle: {
    marginTop: normalize(6)
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
  listItemStyle: PropTypes.object,
  listsWithoutArrows: PropTypes.bool,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  noOvertitle: PropTypes.bool,
  rightImage: PropTypes.bool,
  showOpenStatus: PropTypes.bool,
  titleFirst: PropTypes.bool,
  withCard: PropTypes.bool
};

TextListItem.defaultProps = {
  leftImage: false,
  listsWithoutArrows: false,
  noSubtitle: false,
  noOvertitle: false,
  rightImage: false,
  withCard: false
};
