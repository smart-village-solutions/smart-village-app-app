import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Global navigation ref passed to <NavigationContainer>.
 * Provides `getCurrentRoute()` which always returns the focused leaf route,
 * even before nested navigator state is registered in the parent state tree.
 */
export const navigationRef = createNavigationContainerRef();
