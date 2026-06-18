import { NavigationState, PartialState, useNavigationState } from '@react-navigation/native';
import _filter from 'lodash/filter';
import React, { useContext, useMemo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../config';
import { useAccessibilityPreferences, useHomeRefresh, useStaticContent } from '../hooks';
import { navigationRef, type RootNavigationParamList } from '../navigation/navigationRef';
import { useReadAloudAvailability } from '../ReadAloudAvailabilityProvider';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { FloatingReadAloudPlayer } from './FloatingReadAloudPlayer';
import { Image } from './Image';

type TButton = {
  icon?: string;
  iconName?: string;
  params?: RootNavigationParamList[ScreenName];
  accessibilityLabel?: string;
  routeName: ScreenName;
  visibleScreens?: string[];
};

// eslint-disable-next-line complexity
export const FloatingButton = ({
  bottomOffset = 0,
  publicJsonFile
}: {
  bottomOffset?: number;
  publicJsonFile: string;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const { features, preferences, setPreference } = useAccessibilityPreferences();
  const { getRouteItems, isRouteAvailable } = useReadAloudAvailability();

  // Subscribe to navigation state to trigger re-renders on every route change.
  // We intentionally do NOT use the returned value because on the initial render
  // the parent navigator's nested stack state is not yet populated, causing a
  // recursive traversal to resolve to a stack name (e.g. "AppStack") instead of
  // the actual screen name (e.g. "Home").
  // `navigationRef.getCurrentRoute()` traverses the full navigation tree via the
  // root NavigationContainer ref and always returns the focused leaf route.
  useNavigationState((state: NavigationState | PartialState<NavigationState>) => state);
  const activeRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined;
  const activeRouteName = activeRoute?.name ?? '';
  const activeRouteKey = activeRoute?.key;
  const isReadAloudQuickToggleEnabled = preferences.readAloudEnabled;
  const readAloudItems = getRouteItems(activeRouteKey);
  const showReadAloudQuickToggle = features.readAloud && isRouteAvailable(activeRouteKey);
  const readAloudQuickToggleLabel = isReadAloudQuickToggleEnabled
    ? texts.settingsContents.accessibility.readAloud.disableQuickToggle
    : texts.settingsContents.accessibility.readAloud.enableQuickToggle;
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

  // Filter items whose `visibleScreens` list includes the current screen.
  // Items without a `visibleScreens` array are shown on every screen.
  const visibleItems = loading
    ? []
    : _filter(
        data || [],
        ({ visibleScreens }) => !visibleScreens?.length || visibleScreens.includes(activeRouteName)
      );

  if (!showReadAloudQuickToggle && !visibleItems.length) return null;

  return (
    <View style={[styles.container, positionStyle]}>
      {showReadAloudQuickToggle && (
        <View style={styles.readAloudRow}>
          {isReadAloudQuickToggleEnabled && (
            <FloatingReadAloudPlayer key={activeRouteKey} items={readAloudItems} />
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityLabel={readAloudQuickToggleLabel}
            accessibilityRole="switch"
            accessibilityState={{ checked: isReadAloudQuickToggleEnabled }}
            onPress={() => setPreference('readAloudEnabled', !isReadAloudQuickToggleEnabled)}
            style={[
              styles.button,
              styles.readAloudButton,
              isReadAloudQuickToggleEnabled ? styles.buttonEnabled : styles.buttonDisabled
            ]}
          >
            <Icon.NamedIcon
              name={isReadAloudQuickToggleEnabled ? 'volume' : 'volume-off'}
              color={colors.lightestText}
              size={normalize(24)}
            />
          </TouchableOpacity>
        </View>
      )}

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
          style={[styles.button, styles.buttonEnabled]}
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
  buttonDisabled: {
    backgroundColor: colors.darkText
  },
  buttonEnabled: {
    backgroundColor: colors.primary
  },
  container: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: normalize(16)
  },

  icon: {
    height: normalize(24),
    width: normalize(24)
  },
  readAloudButton: {
    marginTop: 0
  },
  readAloudRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: normalize(8)
  }
});
