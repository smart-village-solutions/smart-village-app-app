import { RouteProp } from '@react-navigation/native';
import React, { useContext } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { SettingsContext } from '../SettingsProvider';

import { Icon, colors, consts } from './../config';
import { useLoginProfile } from './../hooks';

export const LOGIN_MODAL = 'loginModal';

const { a11yLabel } = consts;

type Props = {
  route: RouteProp<any, string>;
  style: ViewStyle;
};

export const LoginHeader = ({ route, style }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings } = globalSettings;
  const { profile } = settings;

  const { isLoggedIn, loading, login, logout } = useLoginProfile(profile);

  if (loading) return null;

  return (
    <TouchableOpacity
      onPress={isLoggedIn ? logout : login}
      accessibilityLabel={isLoggedIn ? a11yLabel.logout : a11yLabel.login}
      accessibilityHint={isLoggedIn ? a11yLabel.logoutHint : a11yLabel.loginHint}
    >
      {isLoggedIn ? (
        <Icon.Logout color={colors.lightestText} style={style} />
      ) : (
        <Icon.Login color={colors.lightestText} style={style} />
      )}
    </TouchableOpacity>
  );
};
