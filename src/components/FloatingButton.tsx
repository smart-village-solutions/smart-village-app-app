import { NavigationState, PartialState, useNavigationState } from '@react-navigation/native';
import _filter from 'lodash/filter';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, normalize } from '../config';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { navigationRef } from '../navigation/navigationRef';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { Button } from './Button';
import { Image } from './Image';
import { Wrapper } from './Wrapper';

type TButton = {
  icon?: string;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  invert?: boolean;
  params?: Record<string, unknown>;
  routeName: ScreenName;
  title: string;
  visibleScreens?: string[];
};

export const FloatingButton = ({ publicJsonFile }: { publicJsonFile: string }) => {
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
  const activeRouteName = navigationRef.getCurrentRoute()?.name ?? '';

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
    <View style={[styles.container, stylesWithProps({ navigationType }).position]}>
      <Wrapper>
        {visibleItems.map((item, index) => (
          <Button
            icon={
              item.icon ? (
                <Image source={{ uri: item.icon }} style={styles.image} />
              ) : item.iconName ? (
                <Icon.NamedIcon name={item.iconName} />
              ) : undefined
            }
            iconPosition={item.iconPosition || 'left'}
            invert={item.invert || false}
            key={`${item.title}-${index}`}
            notFullWidth
            onPress={() => navigationRef.navigate(item.routeName as never, item.params as never)}
            title={item.title}
          />
        ))}
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'absolute'
  },
  image: {
    height: normalize(24),
    width: normalize(24)
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ navigationType }: { navigationType: string }) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '5%' : 0
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
