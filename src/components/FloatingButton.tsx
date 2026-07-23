import { NavigationState, PartialState, useNavigationState } from '@react-navigation/native';
import _filter from 'lodash/filter';
import React, { useContext, useMemo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize } from '../config';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { navigationRef, type RootNavigationParamList } from '../navigation/navigationRef';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { Image } from './Image';

type TButton = {
  icon?: string;
  iconName?: string;
  params?: RootNavigationParamList[ScreenName];
  accessibilityLabel?: string;
  routeName: ScreenName;
  visibleScreens?: string[];
};

export const FloatingButton = ({
  bottomOffset = 0,
  publicJsonFile
}: {
  bottomOffset?: number;
  publicJsonFile: string;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  // Subscribe to navigation state to trigger re-renders on every route change.
  // We intentionally do NOT use the returned value because on the initial render
  // the parent navigator's nested stack state is not yet populated, causing a
  // recursive traversal to resolve to a stack name (e.g. "AppStack") instead of
  // the actual screen name (e.g. "Home").
  // `navigationRef.getCurrentRoute()` traverses the full navigation tree via the
  // root NavigationContainer ref and always returns the focused leaf route.
  useNavigationState((state: NavigationState | PartialState<NavigationState>) => state);
  const activeRouteName = navigationRef.isReady()
    ? navigationRef.getCurrentRoute()?.name ?? ''
    : '';
  const positionStyle = useMemo(
    () => ({ bottom: navigationType === 'drawer' ? '5%' : normalize(16) + bottomOffset }),
    [bottomOffset, navigationType]
  );

  const { data, loading, refetch } = useStaticContent<TButton[]>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  useHomeRefresh(refetch);

  if (loading || !data?.length) return null;

  // Filter items whose `visibleScreens` list includes the current screen.
  // Items without a `visibleScreens` array are shown on every screen.
  const visibleItems = _filter(
    data,
    ({ visibleScreens }) => !visibleScreens?.length || visibleScreens.includes(activeRouteName)
  );

  if (!visibleItems.length) return null;

  return (
    <View style={[styles.container, positionStyle]}>
      {visibleItems.map((item, index) => (
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityLabel={item.accessibilityLabel}
          accessibilityRole="button"
          key={`${item.accessibilityLabel}-${index}`}
          onPress={() => {
            if (!navigationRef.isReady()) {
              return;
            }

            navigationRef.navigate(item.routeName, item.params);
          }}
          style={styles.button}
        >
          {item.icon ? (
            <Image source={{ uri: item.icon }} style={styles.icon} />
          ) : item.iconName ? (
            <Icon.NamedIcon name={item.iconName} color={colors.lightestText} size={normalize(24)} />
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const BUTTON_SIZE = normalize(56);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: BUTTON_SIZE / 2,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    marginTop: normalize(8),
    width: BUTTON_SIZE,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4
      },
      android: {
        elevation: 6
      }
    })
  },
  container: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: normalize(16)
  },

  icon: {
    height: normalize(24),
    width: normalize(24)
  }
});
