import { useFocusEffect, useNavigation } from 'expo-router/react-navigation';
import React, { useCallback, useContext, useSyncExternalStore } from 'react';
import { Alert, AppState } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { SettingsContext } from '../../SettingsProvider';
import { texts } from '../../config/texts';
import { accessibleKlimaTalerConfiguration } from '../../klimaTaler/appearance';
import { useHomeRefresh } from '../../hooks';
import { klimaTalerEntry, openKlimaTaler } from '../../klimaTaler/entry';
import { klimaTalerSummary } from '../../klimaTaler/summary';
import { resolveImportedOffersMap } from '../../klimaTaler/offersConfiguration';
import { QUERY_TYPES } from '../../queries';
import { ScreenName, WidgetProps } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { resolveKlimaTalerWidget, KlimaTalerAction } from '../../klimaTaler/widgetConfiguration';

import { KlimaTalerCard } from './KlimaTalerCard';

export const KlimaTalerWidget = ({ text, additionalProps }: WidgetProps) => {
  const { globalSettings } = useContext(SettingsContext);
  const navigation = useNavigation();
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
    } else if (action.target === 'badges') {
      void openKlimaTaler('badges');
    } else if (action.target === 'map') {
      const importedMap = resolveImportedOffersMap(globalSettings.settings?.['klima-taler']);
      if (importedMap && !importedMap.queryVariables) {
        Alert.alert(texts.klimaTaler.title, texts.klimaTaler.errors.E_CONFIGURATION);
        return;
      }
      navigation.navigate(ScreenName.Index, {
        title: action.label,
        query: QUERY_TYPES.POINTS_OF_INTEREST,
        queryVariables: { initialFilter: 'map', ...importedMap?.queryVariables },
        skipResourceFilters: true,
        includeKlimaTaler: !importedMap,
        ...(importedMap && { showAllPoiCategories: true })
      });
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
