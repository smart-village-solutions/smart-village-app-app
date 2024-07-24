import React from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { volunteerProfileImage } from '../../helpers';
import { VolunteerUser } from '../../types';

export const VolunteerAvatar = ({
  item,
  index = 0,
  totalCount = 1,
  MAX_AVATARS_COUNT = 10
}: {
  item: { user: VolunteerUser };
  index: number;
  totalCount: number;
  MAX_AVATARS_COUNT: number;
}) => {
  const { user } = item;
  const { guid, display_name: displayName } = user || {};

  // get initials from the display name
  const title = displayName
    ?.split(' ')
    ?.map((part) => part[0])
    ?.join('');

  const uri = !!guid && volunteerProfileImage(guid);

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

const styles = StyleSheet.create({
  border: {
    borderColor: colors.darkText,
    borderRadius: normalize(34),
    borderWidth: normalize(1)
  },
  containerStyle: {
    borderRadius: normalize(34),
    height: normalize(34),
    padding: normalize(2),
    width: normalize(34)
  },
  marginLeft: {
    marginLeft: normalize(-12)
  },
  overlayContainerStyle: {
    backgroundColor: colors.surface
  },
  placeholderStyle: {
    backgroundColor: colors.surface
  },
  titleStyle: {
    color: colors.darkText,
    fontSize: normalize(12)
  }
});
