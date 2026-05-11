import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../../config';
import { spaceNewLines, trimNewLines } from '../../helpers';
import { Image } from '../Image';
import { HeadlineText, RegularText } from '../Text';
import { Touchable } from '../Touchable';

type LifeSituationListItemProps = {
  bottomDivider?: boolean;
  imageUrl?: string;
  onPress: () => void;
  subtitle?: string;
  title: string;
};

export const LifeSituationListItem = ({
  bottomDivider = true,
  imageUrl,
  onPress,
  subtitle,
  title
}: LifeSituationListItemProps) => {
  const sanitizedTitle = trimNewLines(title) ?? '';

  return (
    <ListItem
      bottomDivider={bottomDivider}
      containerStyle={styles.container}
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${sanitizedTitle}) ${consts.a11yLabel.button}`}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          borderRadius={normalize(8)}
          containerStyle={styles.imageContainer}
        />
      ) : null}

      <ListItem.Content>
        <HeadlineText small>{sanitizedTitle}</HeadlineText>
        {!!subtitle && (
          <RegularText small style={styles.subtitle}>
            {spaceNewLines(subtitle)}
          </RegularText>
        )}
      </ListItem.Content>

      <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />
    </ListItem>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: normalize(16)
  },
  image: {
    height: normalize(72),
    width: normalize(96)
  },
  imageContainer: {
    alignSelf: 'flex-start'
  },
  subtitle: {
    marginTop: normalize(6)
  }
});
