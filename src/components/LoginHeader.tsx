import React, { useContext } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { Icon, colors, consts } from '../config';
import { useLoginProfile } from '../hooks';
import { useProfileContext } from '../ProfileProvider';

const { a11yLabel } = consts;
const EMPTY_PROFILE = {
  clientId: '',
  clientSecret: '',
  scopes: [],
  serverUrl: '',
  usePKCE: false
};

type Props = {
  style?: StyleProp<ViewStyle>;
};

type TProfileSettings = {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  serverUrl: string;
  usePKCE?: boolean;
};

export const LoginHeader = ({ style }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { isLoggedIn: isProfileLoggedIn, refresh } = useProfileContext();
  const settings = (globalSettings?.settings || {}) as { profile?: TProfileSettings };
  const profile = settings.profile;
  const hasProfileConfig = !!profile?.clientId && !!profile?.serverUrl;

  const { loading, login, logout } = useLoginProfile(profile || EMPTY_PROFILE, {
    enabled: hasProfileConfig,
    onLoginSuccess: refresh,
    onLogout: refresh
  });

  if (!hasProfileConfig) {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={isProfileLoggedIn ? logout : login}
      accessibilityLabel={isProfileLoggedIn ? a11yLabel.logout : a11yLabel.login}
      accessibilityHint={isProfileLoggedIn ? a11yLabel.logoutHint : a11yLabel.loginHint}
    >
      <Icon.NamedIcon
        name={isProfileLoggedIn ? 'logout-2' : 'login-2'}
        color={colors.darkText}
        style={style}
      />
    </TouchableOpacity>
  );
};
