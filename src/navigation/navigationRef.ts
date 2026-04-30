import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Param list for the global navigation ref.
 * This broad typing keeps navigation type-safe without restricting route names here.
 */
export type RootNavigationParamList = Record<string, object | undefined>;

/**
 * Global navigation ref passed to <NavigationContainer>.
 * Provides `getCurrentRoute()` which always returns the focused leaf route,
 * even before nested navigator state is registered in the parent state tree.
 */
export const navigationRef = createNavigationContainerRef<RootNavigationParamList>();
