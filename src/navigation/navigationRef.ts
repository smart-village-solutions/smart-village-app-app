import { createNavigationContainerRef } from 'expo-router/react-navigation';

/**
 * Param list for the global navigation ref.
 * This broad typing keeps navigation type-safe without restricting route names here.
 */
export type RootNavigationParamList = Record<string, object | undefined>;
type PendingNavigationAction = {
  action: () => void;
  isTargetReady?: () => boolean;
  pendingKey?: string;
};

const pendingNavigationActions: PendingNavigationAction[] = [];

/**
 * Global navigation ref passed to <NavigationContainer>.
 * Provides `getCurrentRoute()` which always returns the focused leaf route,
 * even before nested navigator state is registered in the parent state tree.
 */
export const navigationRef = createNavigationContainerRef<RootNavigationParamList>();

const canRunNavigationAction = ({ isTargetReady }: PendingNavigationAction) =>
  navigationRef.isReady() && (!isTargetReady || isTargetReady());

export const hasRootNavigationRoute = (routeName: string) =>
  navigationRef.getRootState()?.routeNames?.includes(routeName) ?? false;

export const runWhenNavigationReady = (
  action: PendingNavigationAction['action'],
  isTargetReady?: PendingNavigationAction['isTargetReady'],
  pendingKey?: PendingNavigationAction['pendingKey']
) => {
  const pendingAction = { action, isTargetReady, pendingKey };

  if (pendingKey) {
    const existingActionIndex = pendingNavigationActions.findIndex(
      (queuedAction) => queuedAction.pendingKey === pendingKey
    );

    if (existingActionIndex >= 0) {
      pendingNavigationActions.splice(existingActionIndex, 1);
    }
  }

  if (canRunNavigationAction(pendingAction)) {
    action();
    return;
  }

  pendingNavigationActions.push(pendingAction);
};

export const flushPendingNavigationActions = () => {
  if (!navigationRef.isReady()) {
    return;
  }

  const actionsToCheck = pendingNavigationActions.splice(0);

  actionsToCheck.forEach((pendingAction) => {
    if (!canRunNavigationAction(pendingAction)) {
      pendingNavigationActions.push(pendingAction);
      return;
    }

    try {
      pendingAction.action();
    } catch (error) {
      // Keep draining the queue so one bad action does not block later navigations.
      console.error('[navigationRef] queued navigation action failed', error);
    }
  });
};
