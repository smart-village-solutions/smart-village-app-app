import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../config';
import { arrowRight } from '../icons';
import { Icon } from './Icon';
import { Image } from './Image';

import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';
import { trimNewLines } from '../helpers';

export const TextListItem = memo(({ navigation, item, noSubtitle, leftImage }) => {
  const { routeName, params, subtitle, title, bottomDivider, topDivider, picture } = item;

  return (
    <ListItem
      title={noSubtitle || !subtitle ? null : <RegularText small>{subtitle}</RegularText>}
      subtitle={<BoldText noSubtitle={noSubtitle}>{trimNewLines(title)}</BoldText>}
      bottomDivider={bottomDivider !== undefined ? bottomDivider : true}
      topDivider={topDivider !== undefined ? topDivider : false}
      containerStyle={styles.container}
      rightIcon={<Icon xml={arrowRight(colors.primary)} />}
      leftIcon={
        leftImage &&
        !!picture &&
        !!picture.url && (
          <Image
            source={{ uri: picture.url }}
            style={styles.smallImage}
            containerStyle={styles.smallImageContainer}
          />
        )
      }
      onPress={() =>
        navigation &&
        navigation.navigate({
          routeName,
          params
        })
      }
      disabled={!navigation}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`${title} (Taste)`}
    />
  );
});

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
