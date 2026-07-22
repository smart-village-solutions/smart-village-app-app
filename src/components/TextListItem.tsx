import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { memo, NamedExoticComponent, useMemo, Validator } from 'react';
import { ImageStyle, StyleSheet, ViewStyle } from 'react-native';
import { ListItem } from 'react-native-elements';

import { consts, Icon, normalize } from '../config';
import { isOpen, trimNewLines } from '../helpers';
import { useTheme } from '../hooks/useTheme';

import { Image } from './Image';
import { BoldText, HeadlineText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

export type ItemData = {
  id: string;
  accessibilityLabel?: string;
  badge?: { value: string; textStyle: { color: string } };
  bottomDivider?: boolean;
  count?: number;
  isHeadlineTitle?: boolean;
  leftIcon?: React.ReactElement;
  onPress?: (navigation: any) => void;
  overtitle?: string;
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
  noOvertitle?: boolean;
  noSubtitle?: boolean;
  rightImage?: boolean;
  showOpenStatus?: boolean;
  subtitleNumberOfLines?: number;
  titleNumberOfLines?: number;
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
    leftImage = false,
    listItemStyle,
    listsWithoutArrows,
    navigation,
    noOvertitle,
    noSubtitle = false,
    rightImage = false,
    showOpenStatus,
    subtitleNumberOfLines,
    titleNumberOfLines,
    withCard = false
  }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const {
      badge,
      accessibilityLabel,
      bottomDivider,
      count,
      isHeadlineTitle = true,
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
    let titleText = isHeadlineTitle ? (
      <HeadlineText small numberOfLines={titleNumberOfLines}>
        {trimNewLines(title)}
      </HeadlineText>
    ) : withCard ? (
      <BoldText style={styles.topMargin} numberOfLines={titleNumberOfLines}>
        {trimNewLines(title)}
      </BoldText>
    ) : (
      <BoldText small numberOfLines={titleNumberOfLines}>
        {trimNewLines(title)}
      </BoldText>
    );

    let status = '';
    if (showOpenStatus) {
      status = isOpen(params?.details?.openingHours)?.open ? 'Jetzt geöffnet' : 'Geschlossen';
    }

    const defaultAccessibilityLabel = overtitle
      ? `${trimNewLines(overtitle)} (${trimNewLines(title)}) ${consts.a11yLabel.button}`
      : `(${trimNewLines(title)}) ${consts.a11yLabel.button}`;

    if (teaserTitle) {
      titleText = (
        <>
          {titleText}
          <RegularText small numberOfLines={subtitleNumberOfLines}>
            {teaserTitle}
          </RegularText>
        </>
      );
    }

    if (statustitle) {
      titleText = (
        <>
          {titleText}
          <WrapperRow style={styles.statustitleWrapper}>
            {!!statustitleIcon && statustitleIcon}
            <RegularText small placeholder numberOfLines={subtitleNumberOfLines}>
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
        containerStyle={[styles.container, containerStyle]}
        badge={badge}
        onPress={() => (onPress ? onPress(navigation) : navigate())}
        disabled={!navigation}
        delayPressIn={0}
        Component={Touchable}
        accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      >
        {leftIcon ||
          (leftImage && !!picture?.url ? (
            <Image
              source={{ uri: picture.url }}
              style={[styles.smallImage, imageStyle, withCard && styles.withBigCardStyle]}
              borderRadius={normalize(8)}
              containerStyle={[styles.smallImageContainer, imageContainerStyle]}
            />
          ) : undefined)}

        {withCard ? (
          <ListItem.Content>
            {!!overtitle && (
              <HeadlineText smallest uppercase style={styles.overtitleMarginBottom}>
                {trimNewLines(overtitle)}
              </HeadlineText>
            )}
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? (
              titleText
            ) : (
              <RegularText small style={styles.subtitle} numberOfLines={subtitleNumberOfLines}>
                {subtitle}
              </RegularText>
            )}
          </ListItem.Content>
        ) : (
          <ListItem.Content style={listItemStyle}>
            {!noOvertitle && !!overtitle && (
              <HeadlineText smallest uppercase style={styles.overtitleMarginBottom}>
                {trimNewLines(overtitle)}
              </HeadlineText>
            )}
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? (
              titleText
            ) : (
              <RegularText small style={styles.subtitle} numberOfLines={subtitleNumberOfLines}>
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

        {!!count && <BoldText>{count}</BoldText>}

        {!listsWithoutArrows && !!navigation && !withCard && (
          <Icon.ArrowRight color={colors.text} size={normalize(18)} />
        )}
      </ListItem>
    );
  }
);
/* eslint-enable complexity */

/* Dynamic theme styles cannot be resolved by react-native/no-unused-styles. */
/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.transparent,
      paddingHorizontal: 0,
      paddingVertical: normalize(16)
    },
    overtitleMarginBottom: {
      marginBottom: normalize(4)
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
    subtitle: {
      marginTop: normalize(6)
    },
    topMargin: {
      marginTop: normalize(4)
    },
    withBigCardStyle: {
      height: normalize(72),
      width: normalize(96)
    }
  });
/* eslint-enable react-native/no-unused-styles */

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
  noOvertitle: PropTypes.bool,
  noSubtitle: PropTypes.bool,
  rightImage: PropTypes.bool,
  showOpenStatus: PropTypes.bool,
  withCard: PropTypes.bool
};
