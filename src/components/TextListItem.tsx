import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { memo, NamedExoticComponent, Validator } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../config';
import { trimNewLines } from '../helpers';

import { Image } from './Image';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

export type ItemData = {
  id: string;
  badge?: { value: string; textStyle: { color: string } };
  bottomDivider?: boolean;
  leftIcon?: React.ReactElement;
  onPress?: (navigation: any) => void;
  params: Record<string, unknown>;
  picture?: { url: string };
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
  leftImage?: boolean | undefined;
  navigation: StackNavigationProp<Record<string, any>>;
  noSubtitle?: boolean | undefined;
};

/* eslint-disable complexity */
export const TextListItem: NamedExoticComponent<Props> & {
  propTypes?: Record<string, Validator<any>>;
} & {
  defaultProps?: Partial<Props>;
} = memo<Props>(({ item, leftImage, navigation, noSubtitle }) => {
  const {
    badge,
    bottomDivider,
    leftIcon,
    onPress,
    params,
    picture,
    routeName: name,
    statustitle,
    statustitleIcon,
    subtitle,
    teaserTitle,
    title,
    topDivider
  } = item;
  const navigate = () => navigation && navigation.push(name, params);
  let titleText = <BoldText>{trimNewLines(title)}</BoldText>;

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
            style={styles.smallImage}
            containerStyle={styles.smallImageContainer}
          />
        ) : undefined)}

      <ListItem.Content>
        {noSubtitle || !subtitle ? titleText : <RegularText small>{subtitle}</RegularText>}
        {noSubtitle || !subtitle ? undefined : titleText}
      </ListItem.Content>

      {!!navigation && <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />}
    </ListItem>
  );
});
/* eslint-enable complexity */

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
  noSubtitle: PropTypes.bool
};

TextListItem.defaultProps = {
  leftImage: false,
  noSubtitle: false
};
