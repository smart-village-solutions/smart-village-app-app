import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { memo, NamedExoticComponent, Validator } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../config';
import { trimNewLines } from '../helpers';

import { Image } from './Image';
import { BoldText, HeadlineText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

export type ItemData = {
  id: string;
  badge?: { value: string; textStyle: { color: string } };
  bottomDivider?: boolean;
  count?: number;
  leftIcon?: React.ReactElement;
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
  item: ItemData;
  leftImage?: boolean;
  navigation: StackNavigationProp<Record<string, any>>;
  noSubtitle?: boolean;
  rightImage?: boolean;
  withCard?: boolean;
};

/* eslint-disable complexity */
export const TextListItem: NamedExoticComponent<Props> & {
  propTypes?: Record<string, Validator<any>>;
} = memo<Props>(
  ({
    item,
    leftImage = false,
    navigation,
    noSubtitle = false,
    rightImage = false,
    withCard = false
  }) => {
    const {
      badge,
      bottomDivider,
      count,
      leftIcon,
      onPress,
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
      <HeadlineText small style={{ marginTop: normalize(4) }}>
        {trimNewLines(title)}
      </HeadlineText>
    ) : (
      <BoldText>{trimNewLines(title)}</BoldText>
    );

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
        containerStyle={styles.container}
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
              childrenContainerStyle={styles.smallImage}
              borderRadius={normalize(8)}
              containerStyle={styles.smallImageContainer}
            />
          ) : undefined)}

        {withCard ? (
          <ListItem.Content>
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? (
              titleText
            ) : (
              <RegularText small style={{ marginTop: normalize(6) }}>
                {subtitle}
              </RegularText>
            )}
          </ListItem.Content>
        ) : (
          <ListItem.Content>
            {noSubtitle || !subtitle ? undefined : titleText}
            {noSubtitle || !subtitle ? titleText : <RegularText small>{subtitle}</RegularText>}
          </ListItem.Content>
        )}

        {rightIcon ||
          (rightImage && !!picture?.url ? (
            <Image
              source={{ uri: picture.url }}
              childrenContainerStyle={styles.smallImage}
              borderRadius={normalize(8)}
              containerStyle={styles.smallImageContainer}
            />
          ) : undefined)}

        {!!count && <BoldText>{count}</BoldText>}

        {!!navigation && !withCard && (
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
  smallImage: {
    height: normalize(72),
    width: normalize(96)
  },
  smallImageContainer: {
    alignSelf: 'flex-start'
  },
  statustitleWrapper: {
    marginTop: normalize(7)
  }
});

TextListItem.displayName = 'TextListItem';

TextListItem.propTypes = {
  item: PropTypes.object.isRequired,
  leftImage: PropTypes.bool,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  rightImage: PropTypes.bool,
  withCard: PropTypes.bool
};
