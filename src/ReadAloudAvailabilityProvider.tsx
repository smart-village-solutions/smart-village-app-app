import { RouteProp, useRoute } from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { AccessibilityContext } from './AccessibilityProvider';
import { DetailSpeechItem } from './helpers/accessibility/detailSpeechParser';

type RegisteredReadAloudContent = {
  items: DetailSpeechItem[];
  order: number;
};

type RegisteredReadAloudContentByRoute = Record<string, Record<string, RegisteredReadAloudContent>>;

type ReadAloudAvailabilityContextValue = {
  getRouteItems: (routeKey?: string) => DetailSpeechItem[];
  isRouteAvailable: (routeKey?: string) => boolean;
  playerBottomSpacing: number;
  registerContent: (routeKey: string, contentKey: string, items: DetailSpeechItem[]) => void;
  setPlayerBottomSpacing: (spacing: number) => void;
  unregisterContent: (routeKey: string, contentKey: string) => void;
};

const ReadAloudAvailabilityContext = createContext<ReadAloudAvailabilityContextValue>({
  getRouteItems: () => [],
  isRouteAvailable: () => false,
  playerBottomSpacing: 0,
  registerContent: () => undefined,
  setPlayerBottomSpacing: () => undefined,
  unregisterContent: () => undefined
});

export const ReadAloudAvailabilityProvider = ({ children }: { children: React.ReactNode }) => {
  const contentOrderRef = useRef(0);
  const [contentByRoute, setContentByRoute] = useState<RegisteredReadAloudContentByRoute>({});
  const [playerBottomSpacing, setPlayerBottomSpacing] = useState(0);

  const registerContent = useCallback(
    (routeKey: string, contentKey: string, items: DetailSpeechItem[]) => {
      setContentByRoute((prev) => {
        const routeContent = prev[routeKey] || {};
        const existingContent = routeContent[contentKey];
        const order = existingContent?.order ?? contentOrderRef.current++;

        return {
          ...prev,
          [routeKey]: {
            ...routeContent,
            [contentKey]: {
              items,
              order
            }
          }
        };
      });
    },
    []
  );

  const getRouteItems = useCallback(
    (routeKey?: string) => {
      if (!routeKey) return [];

      return Object.values(contentByRoute[routeKey] || {})
        .sort((left, right) => left.order - right.order)
        .flatMap((content) => content.items);
    },
    [contentByRoute]
  );

  const isRouteAvailable = useCallback(
    (routeKey?: string) => {
      if (!routeKey) return false;

      return Object.values(contentByRoute[routeKey] || {}).some((content) => content.items.length);
    },
    [contentByRoute]
  );

  const updatePlayerBottomSpacing = useCallback((spacing: number) => {
    setPlayerBottomSpacing(spacing);
  }, []);

  const unregisterContent = useCallback((routeKey: string, contentKey: string) => {
    setContentByRoute((prev) => {
      const routeContent = prev[routeKey];
      if (!routeContent?.[contentKey]) return prev;

      const remainingContent = { ...routeContent };
      const remainingRoutes = { ...prev };
      delete remainingContent[contentKey];

      if (!Object.keys(remainingContent).length) {
        delete remainingRoutes[routeKey];
        return remainingRoutes;
      }

      return {
        ...remainingRoutes,
        [routeKey]: remainingContent
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      getRouteItems,
      isRouteAvailable,
      playerBottomSpacing,
      registerContent,
      setPlayerBottomSpacing: updatePlayerBottomSpacing,
      unregisterContent
    }),
    [
      getRouteItems,
      isRouteAvailable,
      playerBottomSpacing,
      registerContent,
      unregisterContent,
      updatePlayerBottomSpacing
    ]
  );

  return (
    <ReadAloudAvailabilityContext.Provider value={value}>
      {children}
    </ReadAloudAvailabilityContext.Provider>
  );
};

export const useReadAloudAvailability = () => useContext(ReadAloudAvailabilityContext);

export const useRegisterReadAloudContent = (
  contentKey: string,
  items: DetailSpeechItem[],
  isAvailable: boolean
) => {
  const route = useRoute<RouteProp<Record<string, object | undefined>, string>>();
  const { registerContent, unregisterContent } = useReadAloudAvailability();

  useEffect(() => {
    if (!isAvailable) return undefined;

    registerContent(route.key, contentKey, items);

    return () => unregisterContent(route.key, contentKey);
  }, [contentKey, isAvailable, items, registerContent, route.key, unregisterContent]);
};

export const useReadAloudPlayerBottomSpacing = () => {
  const route = useRoute<RouteProp<Record<string, object | undefined>, string>>();
  const { features, isReadAloudEnabled } = useContext(AccessibilityContext);
  const { isRouteAvailable, playerBottomSpacing } = useReadAloudAvailability();

  return features.readAloud && isReadAloudEnabled && isRouteAvailable(route.key)
    ? playerBottomSpacing
    : 0;
};

export const useReadAloudScrollContentContainerStyle = <T extends StyleProp<ViewStyle>>(
  style?: T
) => {
  const bottomSpacing = useReadAloudPlayerBottomSpacing();

  return useMemo(() => {
    if (!bottomSpacing) return style;

    const flattenedStyle = StyleSheet.flatten(style) || {};
    const currentPaddingBottom =
      typeof flattenedStyle.paddingBottom === 'number' ? flattenedStyle.paddingBottom : 0;

    return [style, { paddingBottom: currentPaddingBottom + bottomSpacing }];
  }, [bottomSpacing, style]);
};
