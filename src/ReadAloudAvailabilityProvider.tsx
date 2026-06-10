import { RouteProp, useRoute } from '@react-navigation/native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ReadAloudAvailabilityContextValue = {
  isRouteAvailable: (routeKey?: string) => boolean;
  registerContent: (routeKey: string, contentKey: string) => void;
  unregisterContent: (routeKey: string, contentKey: string) => void;
};

const ReadAloudAvailabilityContext = createContext<ReadAloudAvailabilityContextValue>({
  isRouteAvailable: () => false,
  registerContent: () => undefined,
  unregisterContent: () => undefined
});

export const ReadAloudAvailabilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [availableContentByRoute, setAvailableContentByRoute] = useState<
    Record<string, Set<string>>
  >({});

  const registerContent = useCallback((routeKey: string, contentKey: string) => {
    setAvailableContentByRoute((prev) => ({
      ...prev,
      [routeKey]: new Set([...(prev[routeKey] || []), contentKey])
    }));
  }, []);

  const unregisterContent = useCallback((routeKey: string, contentKey: string) => {
    setAvailableContentByRoute((prev) => {
      const routeContent = prev[routeKey];
      if (!routeContent?.has(contentKey)) return prev;

      const remainingContent = new Set(routeContent);
      const remainingRoutes = { ...prev };
      remainingContent.delete(contentKey);
      delete remainingRoutes[routeKey];

      if (!remainingContent.size) {
        return remainingRoutes;
      }

      return {
        ...remainingRoutes,
        [routeKey]: remainingContent
      };
    });
  }, []);

  const isRouteAvailable = useCallback(
    (routeKey?: string) => !!routeKey && !!availableContentByRoute[routeKey]?.size,
    [availableContentByRoute]
  );

  const value = useMemo(
    () => ({
      isRouteAvailable,
      registerContent,
      unregisterContent
    }),
    [isRouteAvailable, registerContent, unregisterContent]
  );

  return (
    <ReadAloudAvailabilityContext.Provider value={value}>
      {children}
    </ReadAloudAvailabilityContext.Provider>
  );
};

export const useReadAloudAvailability = () => useContext(ReadAloudAvailabilityContext);

export const useRegisterReadAloudContent = (contentKey: string, isAvailable: boolean) => {
  const route = useRoute<RouteProp<Record<string, object | undefined>, string>>();
  const { registerContent, unregisterContent } = useReadAloudAvailability();

  useEffect(() => {
    if (!isAvailable) return undefined;

    registerContent(route.key, contentKey);

    return () => unregisterContent(route.key, contentKey);
  }, [contentKey, isAvailable, registerContent, route.key, unregisterContent]);
};
