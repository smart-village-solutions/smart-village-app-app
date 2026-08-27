import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';

import { TextListItem, WrapperHorizontal } from '../../components';
import { texts } from '../../config';
import { ScreenName } from '../../types';

export const ProfileSettingsScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { email = '', member = {} } = route.params;

  return (
    <WrapperHorizontal>
      <TextListItem
        item={{
          isHeadlineTitle: false,
          onPress: () => navigation.navigate(ScreenName.ProfileUpdate, { member }),
          routeName: ScreenName.ProfileUpdate,
          bottomDivider: true,
          topDivider: true,
          title: texts.profile.editProfile
        }}
        navigation={navigation}
        noSubtitle
      />

      <TextListItem
        item={{
          isHeadlineTitle: false,
          onPress: () => navigation.navigate(ScreenName.ProfileEditMail, { email }),
          routeName: ScreenName.ProfileEditMail,
          bottomDivider: true,
          title: texts.profile.editMail
        }}
        navigation={navigation}
        noSubtitle
      />

      <TextListItem
        item={{
          bottomDivider: true,
          isHeadlineTitle: false,
          onPress: () => navigation.navigate(ScreenName.ProfileEditPassword),
          routeName: ScreenName.ProfileEditPassword,
          title: texts.profile.editPassword
        }}
        navigation={navigation}
        noSubtitle
      />

      <TextListItem
        item={{
          bottomDivider: true,
          isHeadlineTitle: false,
          onPress: () => navigation.navigate(ScreenName.ProfileDelete),
          routeName: ScreenName.ProfileDelete,
          title: texts.profile.deleteProfile
        }}
        navigation={navigation}
        noSubtitle
      />
    </WrapperHorizontal>
  );
};
