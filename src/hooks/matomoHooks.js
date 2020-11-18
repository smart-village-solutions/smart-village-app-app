import { useEffect } from 'react';
import { useMatomo } from 'matomo-tracker-react-native';

/**
 * Tracks app start as action with prefixed 'App' category
 */
export const useMatomoTrackAppStart = () => {
  const { trackAppStart } = useMatomo();

  useEffect(() => {
    trackAppStart();
  }, []);
};

/**
 * Tracks screen view as action with prefixed 'Screen' category
 *
 * @param {String} name - The title of the action being tracked. It is possible to use slashes /
 *                        to set one or several categories for this action. For example, Help /
 *                        Feedback will create the Action Feedback in the category Help.
 */
export const useMatomoTrackScreenView = (name) => {
  const { trackScreenView } = useMatomo();

  useEffect(() => {
    trackScreenView(name);
  }, []);
};
