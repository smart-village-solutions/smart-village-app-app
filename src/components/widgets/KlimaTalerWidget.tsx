import { useFocusEffect } from 'expo-router/react-navigation';
import React, { useCallback, useContext, useSyncExternalStore } from 'react';
import { Alert, AppState } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { accessibleKlimaTalerConfiguration } from '../../klimaTaler/appearance';
import { useHomeRefresh } from '../../hooks';
import { klimaTalerEntry, openKlimaTaler } from '../../klimaTaler/entry';
import { klimaTalerSummary } from '../../klimaTaler/summary';
import { WidgetProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { resolveKlimaTalerWidget, KlimaTalerAction } from '../../klimaTaler/widgetConfiguration';

import { KlimaTalerCard } from './KlimaTalerCard';

export const KlimaTalerWidget = ({ text, additionalProps }: WidgetProps) => {
  const { colors, mode } = useTheme();
  const accessibility = useContext(AccessibilityContext);
  const config = accessibleKlimaTalerConfiguration(
    resolveKlimaTalerWidget(additionalProps, colors, text, mode),
    colors,
    accessibility
  );
  const onAction = (name: KlimaTalerAction) => {
    const action = config.actions[name];
    if (!action.enabled) return;
    if (action.target === 'provider') {
      void openKlimaTaler();
    } else {
      Alert.alert(
        action.alertTitle || config.texts.comingSoonTitle,
        action.alertMessage || config.texts.comingSoonMessage
      );
    }
  };
  const state = useSyncExternalStore(klimaTalerSummary.subscribe, klimaTalerSummary.getSnapshot);
  const entry = useSyncExternalStore(klimaTalerEntry.subscribe, klimaTalerEntry.getSnapshot);
  const refresh = useCallback((reuse = false) => {
    const phase = klimaTalerEntry.getSnapshot().phase;
    if (AppState.currentState === 'active' && phase !== 'opening' && phase !== 'open')
      return klimaTalerSummary.refresh({ reuse });
    return Promise.resolve();
  }, []);

  useHomeRefresh(useCallback(() => void refresh(), [refresh]));
  useFocusEffect(
    useCallback(() => {
      void refresh(true);
    }, [refresh])
  );

  return (
    <KlimaTalerCard
      state={state}
      config={config}
      opening={entry.phase === 'opening'}
      onAction={onAction}
    />
  );
};
