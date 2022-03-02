import _shuffle from 'lodash/shuffle';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-elements';

import { colors, normalize, texts } from '../../config';
import { volunteerProfileImage } from '../../helpers';
import { BoldText } from '../Text';
import { Wrapper } from '../Wrapper';

const keyExtractor = ({ guid }: { guid: string }) => guid;

const renderItem = ({
  item,
  index,
  totalCount
}: {
  item: { id: number; guid: string; display_name: string };
  index: number;
  totalCount: number;
}) => {
  const { guid, display_name: displayName } = item;

  // get initials from the display name
  const title = displayName
    .split(' ')
    .map((part) => part[0])
    .join('');

  const uri = volunteerProfileImage(guid);

  if (totalCount > MAX_AVATARS_COUNT && index == MAX_AVATARS_COUNT) {
    return (
      <Avatar
        containerStyle={[styles.containerStyle, styles.marginLeft]}
        overlayContainerStyle={[styles.overlayContainerStyle, styles.border]}
        rounded
        title={`+${totalCount - MAX_AVATARS_COUNT}`}
        titleStyle={styles.titleStyle}
      />
    );
  }

  return (
    <Avatar
      containerStyle={[styles.containerStyle, index > 0 && styles.marginLeft]}
      overlayContainerStyle={[styles.overlayContainerStyle, !uri && styles.border]}
      placeholderStyle={styles.placeholderStyle}
      rounded
      source={uri ? { uri } : undefined}
      renderPlaceholderContent={
        <Avatar
          containerStyle={[styles.containerStyle]}
          overlayContainerStyle={[styles.overlayContainerStyle, styles.border]}
          rounded
          title={title}
          titleStyle={styles.titleStyle}
        />
      }
    />
  );
};

const MAX_AVATARS_COUNT = 10;

export const VolunteerEventAttending = ({
  data
}: {
  data: [{ id: number; guid: string; display_name: string }];
}) => (
  <Wrapper>
    <BoldText>{texts.volunteer.attending}</BoldText>
    <FlatList
      keyExtractor={keyExtractor}
      data={_shuffle(data.slice(0, MAX_AVATARS_COUNT + 1))}
      renderItem={({ item, index }) =>
        renderItem({
          item,
          index,
          totalCount: data.length
        })
      }
      showsHorizontalScrollIndicator={false}
      horizontal
      bounces={false}
    />
  </Wrapper>
);

const styles = StyleSheet.create({
  border: {
    borderColor: colors.darkText,
    borderWidth: 1
  },
  containerStyle: {
    padding: normalize(2)
  },
  marginLeft: {
    marginLeft: normalize(-12)
  },
  overlayContainerStyle: {
    backgroundColor: colors.lightestText
  },
  placeholderStyle: {
    backgroundColor: colors.lightestText
  },
  titleStyle: {
    color: colors.darkText,
    fontSize: normalize(12)
  }
});
