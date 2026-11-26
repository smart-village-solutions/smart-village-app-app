import { useContext, useMemo, useState } from 'react';

import { SettingsContext } from '../SettingsProvider';
import { useMapSettings } from '../hooks/map/mapFeatureConfig';

import { resolveOffersQuery } from './offersConfiguration';
import { isKlimaTalerConfigured } from './settings';
import { useOffers } from './useOffers';
import { configurationObject } from './widgetConfiguration';
import type { OffersQuery } from './offersTypes';

export const useMapOffers = (eligible = true) => {
  const { globalSettings } = useContext(SettingsContext);
  const { data: mapSettings } = useMapSettings();
  const [visible, setVisible] = useState(true);
  const enabled = eligible && isKlimaTalerConfigured(globalSettings);
  const moduleSettings = configurationObject(globalSettings.settings)['klima-taler'];
  const center = configurationObject(mapSettings).mapCenterPosition;
  const queryKey = JSON.stringify(
    enabled && visible ? resolveOffersQuery(moduleSettings, center) : null
  );
  const query = useMemo<OffersQuery | null>(() => JSON.parse(queryKey), [queryKey]);
  const result = useOffers(query);
  return {
    ...result,
    enabled,
    visible: enabled && visible,
    configured: !!query,
    toggle: () => setVisible((value) => !value),
    locations: result.data?.locations ?? []
  };
};
