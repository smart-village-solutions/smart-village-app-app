import _filter from 'lodash/filter';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

import { Icon, normalize } from '../config';
import { useOptionalAudioPlayback } from '../AudioPlayerProvider';
import { useAccessibilityPreferences, useHomeRefresh, useStaticContent } from '../hooks';
import { navigationRef, type RootNavigationParamList } from '../navigation/navigationRef';
import { useReadAloudAvailability } from '../ReadAloudAvailabilityProvider';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

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
  const { colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const { features } = useAccessibilityPreferences();
  const { getRouteItems, isRouteAvailable } = useReadAloudAvailability();
  const currentTrack = useOptionalAudioPlayback()?.currentTrack;

  // FloatingButton is rendered next to the navigator, so navigator-bound hooks
  // cannot be used here. Subscribe through the root ref to track the focused route.
  const [activeRoute, setActiveRoute] = useState(() =>
    navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined
  );
  const [playerLayout, setPlayerLayout] = useState<{
    expanded: boolean;
    routeKey?: string;
  }>({ expanded: false });

  useEffect(() => {
    const updateActiveRoute = () =>
      setActiveRoute(navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined);

    updateActiveRoute();
    return navigationRef.addListener('state', updateActiveRoute);
  }, []);

  const activeRouteName = activeRoute?.name ?? '';
  const activeRouteKey = activeRoute?.key;
  const readAloudItems = getRouteItems(activeRouteKey);
  const showReadAloudPlayer = features.readAloud && isRouteAvailable(activeRouteKey);
  const hasPlayer = showReadAloudPlayer || !!currentTrack;
  const isPlayerExpanded = playerLayout.routeKey === activeRouteKey && playerLayout.expanded;
  const onPlayerExpandedChange = useCallback(
    (expanded: boolean) => {
      setPlayerLayout((current) =>
        current.routeKey === activeRouteKey && current.expanded === expanded
          ? current
          : { expanded, routeKey: activeRouteKey }
      );
    },
    [activeRouteKey]
  );
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

  if (!hasPlayer && !visibleItems.length) return null;

  const showAdditionalButtons = !!visibleItems.length && (!hasPlayer || !isPlayerExpanded);
  const showCompactRow = hasPlayer && showAdditionalButtons;
  return (
    <View pointerEvents="box-none" style={[styles.container, positionStyle]}>
      {hasPlayer && (
        <View pointerEvents="box-none" style={styles.readAloudRow}>
          <FloatingReadAloudPlayer
            items={showReadAloudPlayer ? readAloudItems : []}
            key={activeRouteKey}
            onExpandedChange={onPlayerExpandedChange}
          />
        </View>
      )}

      {showAdditionalButtons && (
        <View
          pointerEvents="box-none"
          style={
            showCompactRow
              ? [styles.additionalButtons, styles.compactAdditionalButtons]
              : styles.additionalButtons
          }
        >
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
                <Icon.NamedIcon
                  name={item.iconName}
                  color={colors.lightestText}
                  size={normalize(24)}
                />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const BUTTON_SIZE = normalize(56);

const createStyles = (colors) => ({
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

  additionalButtons: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end'
  },

  buttonEnabled: {
    backgroundColor: colors.primary
  },

  container: {
    left: normalize(16),
    position: 'absolute',
    right: normalize(16)
  },

  compactAdditionalButtons: {
    bottom: 0,
    position: 'absolute',
    right: 0
  },

  icon: {
    height: normalize(24),
    width: normalize(24)
  },

  readAloudRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    zIndex: 1
  }
});
