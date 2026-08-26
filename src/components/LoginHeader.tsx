import React, { useContext } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { consts, Icon } from '../config';
import { useTheme } from '../hooks/useTheme';
import { useLoginProfile } from '../hooks/useLoginProfile';
import { useProfileContext } from '../ProfileProvider';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

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
  const { colors } = useTheme();
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
    <HeaderIconButton
      onPress={isProfileLoggedIn ? logout : login}
      accessibilityLabel={isProfileLoggedIn ? a11yLabel.logout : a11yLabel.login}
      accessibilityHint={isProfileLoggedIn ? a11yLabel.logoutHint : a11yLabel.loginHint}
    >
      <Icon.NamedIcon
        name={isProfileLoggedIn ? 'logout-2' : 'login-2'}
        color={colors.darkText}
        size={HEADER_RIGHT_ICON_SIZE}
        style={style}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};
